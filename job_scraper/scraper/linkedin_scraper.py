"""
LinkedIn job scraper — hardened against bans.
Layers: proxy rotation, rate limiting, 429 backoff, request cap, UA rotation.
"""
import asyncio
import os
import re
import time
import random
import concurrent.futures
import urllib.parse
from datetime import datetime
from collections import deque

import httpx
from fake_useragent import UserAgent

from scraper.proxy_pool import pool as proxy_pool
from storage.dedup import is_seen, mark_seen, seen_count
import storage.db as db_module
from config import (
    SEARCH_QUERIES, SEARCH_LOCATION, MAX_JOBS_PER_RUN,
    MIN_DELAY, MAX_DELAY, BACKOFF_ON_BLOCK, MAX_RETRIES
)

_stats = {"scraped": 0, "skipped": 0, "errors": 0, "requests": 0}
_async_loop = asyncio.new_event_loop()
_executor   = concurrent.futures.ThreadPoolExecutor(max_workers=1)
_ua = UserAgent()

# ── Rate limiter: max 200 requests/hour ─────────────────────────────────────
MAX_REQ_PER_HOUR = 200
_req_timestamps: deque = deque()   # sliding window of request times


def _rate_limit():
    """Block if we've hit 200 requests in the last 60 minutes."""
    now = time.time()
    # Drop timestamps older than 1 hour
    while _req_timestamps and now - _req_timestamps[0] > 3600:
        _req_timestamps.popleft()

    if len(_req_timestamps) >= MAX_REQ_PER_HOUR:
        oldest = _req_timestamps[0]
        wait = 3600 - (now - oldest) + 5
        print(f"[RateLimit] Hit {MAX_REQ_PER_HOUR} req/hour cap — waiting {wait:.0f}s")
        time.sleep(wait)

    _req_timestamps.append(time.time())
    _stats["requests"] += 1


def _run_async(coro):
    fut = concurrent.futures.Future()
    def _run():
        try:
            fut.set_result(_async_loop.run_until_complete(coro))
        except Exception as e:
            fut.set_exception(e)
    _executor.submit(_run)
    return fut.result(timeout=30)


def _headers() -> dict:
    return {
        "User-Agent":      _ua.random,          # rotated every call
        "Accept":          "text/html,application/xhtml+xml,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Referer":         "https://www.linkedin.com/jobs/search/",
        "Connection":      "keep-alive",
        "DNT":             "1",
    }


def _make_client(proxy: str | None) -> httpx.Client:
    proxies = None
    if proxy:
        proxies = {"http://": f"http://{proxy}", "https://": f"http://{proxy}"}
    return httpx.Client(
        proxies=proxies,
        follow_redirects=True,
        timeout=20,
    )


def _get(url: str, retries: int = MAX_RETRIES) -> httpx.Response | None:
    """GET with proxy rotation, UA rotation, 429 backoff, and retry."""
    for attempt in range(retries):
        proxy = proxy_pool.get()
        _rate_limit()

        try:
            with _make_client(proxy) as client:
                resp = client.get(url, headers=_headers())

            if resp.status_code == 200:
                return resp

            if resp.status_code == 429:
                backoff = BACKOFF_ON_BLOCK * (attempt + 1)
                print(f"[Scraper] 429 rate limited (attempt {attempt+1}) — "
                      f"backing off {backoff}s, rotating proxy")
                if proxy:
                    proxy_pool.mark_bad(proxy)
                time.sleep(backoff)
                continue

            if resp.status_code in (403, 999):
                print(f"[Scraper] {resp.status_code} blocked — rotating proxy")
                if proxy:
                    proxy_pool.mark_bad(proxy)
                time.sleep(random.uniform(5, 15))
                continue

            print(f"[Scraper] HTTP {resp.status_code} for {url}")
            return None

        except (httpx.ProxyError, httpx.ConnectError, httpx.TimeoutException) as e:
            print(f"[Scraper] Proxy/connection error ({proxy}): {e}")
            if proxy:
                proxy_pool.mark_bad(proxy)
            time.sleep(random.uniform(2, 5))
            continue
        except Exception as e:
            print(f"[Scraper] Request error: {e}")
            return None

    print(f"[Scraper] All {retries} retries exhausted for {url}")
    return None


def _search_url(query: str, location: str, start: int = 0) -> str:
    params = urllib.parse.urlencode({
        "keywords": query,
        "location": location,
        "sortBy":   "DD",
        "f_TPR":    "r86400",
        "start":    start,
        "count":    25,
    })
    return f"https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?{params}"


def _detail_url(job_id: str) -> str:
    return f"https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/{job_id}"


def _parse_cards(html: str) -> list[dict]:
    from selectolax.parser import HTMLParser
    tree = HTMLParser(html)
    jobs = []
    for card in tree.css("li"):
        try:
            base = card.css_first("[data-entity-urn]")
            if not base:
                continue
            urn = base.attributes.get("data-entity-urn", "")
            m = re.search(r'jobPosting:(\d+)', urn)
            if not m:
                continue
            job_id = m.group(1)

            link_node = card.css_first("a.base-card__full-link")
            href = link_node.attributes.get("href", "") if link_node else ""
            clean_url = href.split("?")[0] if href else f"https://www.linkedin.com/jobs/view/{job_id}/"

            title    = card.css_first("h3.base-search-card__title")
            company  = card.css_first("h4.base-search-card__subtitle")
            location = card.css_first(".job-search-card__location")
            posted   = card.css_first("time")

            jobs.append({
                "job_id":    job_id,
                "title":     title.text(strip=True)    if title    else "",
                "company":   company.text(strip=True)  if company  else "",
                "location":  location.text(strip=True) if location else "",
                "posted_at": (posted.attributes.get("datetime") or
                              posted.text(strip=True)) if posted else "",
                "url":       clean_url,
            })
        except Exception:
            continue
    return jobs


def _parse_detail(html: str) -> dict:
    from selectolax.parser import HTMLParser
    tree = HTMLParser(html)
    detail = {"description": "", "employment_type": None,
              "seniority": None, "applicants": None}

    for sel in [".description__text", ".show-more-less-html__markup", ".jobs-description"]:
        node = tree.css_first(sel)
        if node:
            detail["description"] = node.text(strip=True, separator="\n")
            break

    for item in tree.css(".description__job-criteria-item"):
        h = item.css_first(".description__job-criteria-subheader")
        v = item.css_first(".description__job-criteria-text")
        if not h or not v:
            continue
        ht = h.text(strip=True).lower()
        vt = v.text(strip=True)
        if "employment" in ht:
            detail["employment_type"] = vt
        elif "seniority" in ht or "experience" in ht:
            detail["seniority"] = vt

    app = tree.css_first(".num-applicants__caption")
    if app:
        detail["applicants"] = app.text(strip=True)

    return detail


def _scrape_query(query: str, location: str, limit: int):
    collected = 0
    start = 0

    while collected < limit:
        url = _search_url(query, location, start)
        print(f"\n[Scraper] Listing page (start={start}): {url}")

        resp = _get(url)
        if not resp:
            break

        print(f"[Scraper] Status: {resp.status_code} | Size: {len(resp.text)} chars")
        cards = _parse_cards(resp.text)
        print(f"[Scraper] Parsed {len(cards)} cards")

        if not cards:
            break

        for job in cards:
            if collected >= limit:
                break

            job_id = job["job_id"]
            if _run_async(is_seen(job_id)):
                _stats["skipped"] += 1
                continue

            # Human-like delay between detail fetches
            time.sleep(random.uniform(MIN_DELAY, MAX_DELAY))

            detail_resp = _get(_detail_url(job_id))
            if detail_resp:
                job.update(_parse_detail(detail_resp.text))

            job.setdefault("salary",          None)
            job.setdefault("company_url",     None)
            job.setdefault("description",     "")
            job.setdefault("employment_type", None)
            job.setdefault("seniority",       None)
            job.setdefault("applicants",      None)

            try:
                _run_async(db_module.upsert_job(job))
                _run_async(mark_seen(job_id))
                _stats["scraped"] += 1
                collected += 1
                print(f"[Scraper] ✓ [{collected}/{limit}] {job['title']} @ {job['company']}")
            except Exception as e:
                print(f"[Scraper] Storage error: {e}")
                _stats["errors"] += 1

        if len(cards) < 25:
            break
        start += 25
        # Pause between pages
        time.sleep(random.uniform(MIN_DELAY + 1, MAX_DELAY + 2))


def is_off_peak() -> bool:
    """Returns True between 2am–6am local time (safest window)."""
    hour = datetime.now().hour
    return 2 <= hour < 6


def run_scraper(force: bool = False):
    """
    Run the scraper. Pass force=True to bypass off-peak check.
    Scheduler will call this; test_scraper.py passes force=True.
    """
    global _stats
    _stats = {"scraped": 0, "skipped": 0, "errors": 0, "requests": 0}

    if not force and not is_off_peak():
        print(f"[Scraper] Not off-peak (current hour: {datetime.now().hour}). "
              f"Skipping. Use force=True to override.")
        return _stats

    # Pre-warm proxy pool in background
    import threading
    threading.Thread(target=proxy_pool.refresh, daemon=True).start()

    for query in SEARCH_QUERIES:
        print(f"\n[Scraper] === {query} | {SEARCH_LOCATION} ===")
        _scrape_query(query, SEARCH_LOCATION, MAX_JOBS_PER_RUN)

    total = _run_async(seen_count())
    print(f"\n[Scraper] Done — scraped: {_stats['scraped']}, "
          f"skipped: {_stats['skipped']}, errors: {_stats['errors']}, "
          f"requests: {_stats['requests']}, total seen: {total}")
    return _stats
