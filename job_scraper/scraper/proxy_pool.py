"""
Free proxy pool — fetches fresh proxies from public sources,
validates them, rotates every N requests.
No cost, auto-refreshes every 15 minutes.
"""
import httpx
import random
import time
import threading
from datetime import datetime, timedelta

PROXY_SOURCES = [
    # Returns plain text list of ip:port
    "https://api.proxyscrape.com/v2/?request=getproxies&protocol=https&timeout=5000&country=all&ssl=yes&anonymity=elite",
    "https://api.proxyscrape.com/v2/?request=getproxies&protocol=http&timeout=5000&country=US,GB,DE,CA&ssl=yes&anonymity=elite",
]

VALIDATE_URL   = "https://httpbin.org/ip"
VALIDATE_TIMEOUT = 6
REFRESH_EVERY  = timedelta(minutes=15)
MIN_POOL_SIZE  = 5
ROTATE_EVERY   = 15   # requests per proxy before rotating


class ProxyPool:
    def __init__(self):
        self._proxies: list[str] = []
        self._bad:     set[str]  = set()
        self._lock     = threading.Lock()
        self._last_refresh: datetime | None = None
        self._req_count = 0
        self._current: str | None = None

    def _fetch_raw(self) -> list[str]:
        proxies = []
        for url in PROXY_SOURCES:
            try:
                r = httpx.get(url, timeout=10)
                if r.status_code == 200:
                    lines = [l.strip() for l in r.text.splitlines() if ":" in l.strip()]
                    proxies.extend(lines)
            except Exception:
                pass
        return list(set(proxies))

    def _validate(self, proxy: str) -> bool:
        try:
            r = httpx.get(
                VALIDATE_URL,
                proxies={"http://": f"http://{proxy}", "https://": f"http://{proxy}"},
                timeout=VALIDATE_TIMEOUT,
            )
            return r.status_code == 200
        except Exception:
            return False

    def refresh(self, validate_sample: int = 20):
        """Fetch fresh proxies and validate a sample."""
        print("[ProxyPool] Fetching fresh proxies...")
        raw = self._fetch_raw()
        random.shuffle(raw)

        # Quick-validate a sample to build working pool
        working = []
        tested  = 0
        for proxy in raw:
            if proxy in self._bad:
                continue
            if tested >= validate_sample and len(working) >= MIN_POOL_SIZE:
                break
            if self._validate(proxy):
                working.append(proxy)
            tested += 1

        with self._lock:
            self._proxies = working
            self._last_refresh = datetime.now()

        print(f"[ProxyPool] {len(working)} working proxies (tested {tested})")

    def _needs_refresh(self) -> bool:
        if not self._last_refresh:
            return True
        return datetime.now() - self._last_refresh > REFRESH_EVERY

    def get(self) -> str | None:
        """Return current proxy, rotating every ROTATE_EVERY requests."""
        with self._lock:
            if self._needs_refresh() or len(self._proxies) < MIN_POOL_SIZE:
                # Refresh in background after first call
                t = threading.Thread(target=self.refresh, daemon=True)
                t.start()
                if not self._proxies:
                    t.join(timeout=30)  # wait only on first call

            if not self._proxies:
                return None  # fallback to direct

            self._req_count += 1
            if self._req_count % ROTATE_EVERY == 0 or self._current is None:
                self._current = random.choice(self._proxies)

            return self._current

    def mark_bad(self, proxy: str):
        """Remove a proxy that returned 429 or failed."""
        with self._lock:
            self._bad.add(proxy)
            if proxy in self._proxies:
                self._proxies.remove(proxy)
            if self._current == proxy:
                self._current = None
        print(f"[ProxyPool] Marked bad: {proxy} | Pool size: {len(self._proxies)}")


# Singleton
pool = ProxyPool()
