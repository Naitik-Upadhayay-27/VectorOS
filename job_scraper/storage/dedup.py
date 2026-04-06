"""
Redis-backed dedup set — O(1) seen-check per job ID.
Falls back to in-memory set if Redis is unavailable.
"""
import redis.asyncio as aioredis
from config import REDIS_URL

REDIS_KEY = "seen_jobs"
_client = None
_fallback: set = set()

async def get_client():
    global _client
    if _client is None:
        try:
            _client = aioredis.from_url(REDIS_URL, decode_responses=True)
            await _client.ping()
            print("[Dedup] Redis connected")
        except Exception as e:
            print(f"[Dedup] Redis unavailable ({e}), using in-memory fallback")
            _client = None
    return _client

async def is_seen(job_id: str) -> bool:
    client = await get_client()
    if client:
        return bool(await client.sismember(REDIS_KEY, job_id))
    return job_id in _fallback

async def mark_seen(job_id: str):
    client = await get_client()
    if client:
        await client.sadd(REDIS_KEY, job_id)
    else:
        _fallback.add(job_id)

async def seen_count() -> int:
    client = await get_client()
    if client:
        return await client.scard(REDIS_KEY)
    return len(_fallback)
