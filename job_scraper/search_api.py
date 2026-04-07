"""
Production-grade LinkedIn job search API.
Scrapes on-demand per user query, returns max 20 results.
No DB required — results returned directly.

Run:
    venv/Scripts/python.exe -m uvicorn search_api:app --reload --port 8002
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

import asyncio
import re
import time
import random
import urllib.parse
from typing import Optional
from concurrent.futures import ThreadPoolExecutor

import httpx
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fake_useragent import UserAgent
from selectolax.parser import HTMLParser

app = FastAPI(title="LinkedIn Job Search API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

_ua  = UserAgent()
_executor = ThreadPoolExecutor(max_workers=4)

# ── Models ───────────────────────────────────────────────────────────────────

class Job(BaseModel):
    job_id:          str
    title:           str
    company:         str
    location:        str
    employment_type: Optional[str] = None
    seniority:       Optional[str] = None
    salary:          Optional[str] = None
    posted_at:       Optional[str] = None
    applicants:      Optional[str] = None
    description:     Optional[str] = None
    url:             str
    remote:          bool = False
    tags:            list[str] = []
    source:          str = "linkedin"

# ── Scraping helpers ─────────────────────────────────────────────────────────

def _headers() -> dict:
    return {
        "User-Agent":      _ua.random,
        "Accept":          "text/html,application/xhtml+xml,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Referer":         "https://www.linkedin.com/jobs/search/",
        "Connection":      "keep-alive",
        "DNT":             "1",
    }


def _search_url(query: str, location: str, remote: bool,
                job_type: str, start: int) -> str:
    params: dict = {
        "keywords": query,
        "sortBy":   "DD",
        "f_TPR":    "r86400",   # last 24h
        "start":    start,
        "count":    25,
    }
    if location:
        params["location"] = location
    if remote:
        params["f_WT"] = "2"    # remote filter
    if job_type:
        type_map = {
            "full_time":  "F",
            "part_time":  "P",
            "contract":   "C",
            "internship": "I",
        }
        code = type_map.get(job_type.lower())
        if code:
            params["f_JT"] = code

    return ("https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?"
            + urllib.parse.urlencode(params))


def _detail_url(job_id: str) -> str:
    return f"https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/{job_id}"


def _parse_cards(html: str) -> list[dict]:
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
            url  = href.split("?")[0] if href else f"https://www.linkedin.com/jobs/view/{job_id}/"

            title    = card.css_first("h3.base-search-card__title")
            company  = card.css_first("h4.base-search-card__subtitle")
            location = card.css_first(".job-search-card__location")
            posted   = card.css_first("time")

            loc_text = location.text(strip=True) if location else ""
            is_remote = "remote" in loc_text.lower()

            jobs.append({
                "job_id":    job_id,
                "title":     title.text(strip=True)   if title   else "",
                "company":   company.text(strip=True) if company else "",
                "location":  loc_text,
                "posted_at": (posted.attributes.get("datetime") or
                              posted.text(strip=True)) if posted else "",
                "url":       url,
                "remote":    is_remote,
                "tags":      [],
            })
        except Exception:
            continue
    return jobs


def _parse_detail(html: str) -> dict:
    tree = HTMLParser(html)
    detail: dict = {
        "description":     "",
        "employment_type": None,
        "seniority":       None,
        "salary":          None,
        "applicants":      None,
        "tags":            [],
    }

    for sel in [".description__text", ".show-more-less-html__markup"]:
        node = tree.css_first(sel)
        if node:
            detail["description"] = node.text(strip=True, separator="\n")
            break

    for item in tree.css(".description__job-criteria-item"):
        h = item.css_first(".description__job-criteria-subheader")
        v = item.css_first(".description__job-criteria-text")
        if not h or not v:
            continue
        ht, vt = h.text(strip=True).lower(), v.text(strip=True)
        if "employment" in ht:
            detail["employment_type"] = vt
        elif "seniority" in ht or "experience" in ht:
            detail["seniority"] = vt

    app_node = tree.css_first(".num-applicants__caption")
    if app_node:
        detail["applicants"] = app_node.text(strip=True)

    # Extract skills/tags from description
    desc = detail["description"].lower()
    common_skills = [
        "python","javascript","typescript","react","node.js","java","go","rust",
        "aws","gcp","azure","docker","kubernetes","sql","postgresql","mongodb",
        "fastapi","django","flask","spring","graphql","rest","ci/cd","git",
    ]
    detail["tags"] = [s for s in common_skills if s in desc][:6]

    return detail


def _fetch(url: str, retries: int = 3) -> str | None:
    for attempt in range(retries):
        try:
            with httpx.Client(follow_redirects=True, timeout=15) as client:
                resp = client.get(url, headers=_headers())
            if resp.status_code == 200:
                return resp.text
            if resp.status_code == 429:
                time.sleep(30 * (attempt + 1))
                continue
            return None
        except Exception:
            time.sleep(2)
    return None


def _scrape_jobs(query: str, location: str, remote: bool,
                 job_type: str, limit: int) -> list[dict]:
    """Synchronous scrape — runs in thread pool."""
    results = []
    start   = 0

    while len(results) < limit:
        url  = _search_url(query, location, remote, job_type, start)
        html = _fetch(url)
        if not html:
            break

        cards = _parse_cards(html)
        if not cards:
            break

        for card in cards:
            if len(results) >= limit:
                break
            time.sleep(random.uniform(0.8, 1.5))   # polite delay
            detail_html = _fetch(_detail_url(card["job_id"]))
            if detail_html:
                card.update(_parse_detail(detail_html))
            results.append(card)

        if len(cards) < 25:
            break
        start += 25

    return results[:limit]


# ── Routes ───────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "service": "linkedin-job-search"}


@app.get("/jobs/search", response_model=dict)
async def search_jobs(
    q:        str            = Query(...,  description="Job title, skill, or keyword"),
    location: str            = Query("",  description="City, country, or 'Remote'"),
    remote:   bool           = Query(False, description="Remote jobs only"),
    type:     Optional[str]  = Query(None, description="full_time | part_time | contract | internship"),
    limit:    int            = Query(20,  ge=1, le=20, description="Max results (1-20)"),
):
    """
    Search LinkedIn jobs. Returns up to 20 results with full descriptions.
    Results are from the last 24 hours, sorted by most recent.
    """
    if not q.strip():
        raise HTTPException(400, "Query 'q' is required")

    loop = asyncio.get_event_loop()
    jobs = await loop.run_in_executor(
        _executor,
        _scrape_jobs,
        q.strip(), location.strip(), remote, type or "", limit
    )

    return {
        "query":    q,
        "location": location,
        "remote":   remote,
        "count":    len(jobs),
        "jobs":     jobs,
    }


@app.get("/jobs/{job_id}", response_model=dict)
async def get_job(job_id: str):
    """Fetch full details for a specific LinkedIn job ID."""
    loop = asyncio.get_event_loop()
    html = await loop.run_in_executor(
        _executor, _fetch, _detail_url(job_id)
    )
    if not html:
        raise HTTPException(404, "Job not found")
    detail = _parse_detail(html)
    detail["job_id"] = job_id
    detail["url"]    = f"https://www.linkedin.com/jobs/view/{job_id}/"
    return detail
