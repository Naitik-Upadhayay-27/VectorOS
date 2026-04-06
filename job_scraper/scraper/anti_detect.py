"""
Anti-detection helpers — random delays, proxy rotation, header spoofing.
"""
import asyncio
import random
from fake_useragent import UserAgent
from config import PROXY_LIST, MIN_DELAY, MAX_DELAY

_ua = UserAgent()
_proxy_idx = 0

def random_headers() -> dict:
    return {
        "User-Agent": _ua.random,
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Connection": "keep-alive",
        "DNT": "1",
    }

def next_proxy() -> str | None:
    global _proxy_idx
    if not PROXY_LIST:
        return None
    proxy = PROXY_LIST[_proxy_idx % len(PROXY_LIST)]
    _proxy_idx += 1
    return proxy

async def human_delay():
    """Mimic human timing between requests."""
    await asyncio.sleep(random.uniform(MIN_DELAY, MAX_DELAY))
