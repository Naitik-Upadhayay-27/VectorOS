"""
PostgreSQL storage — creates table on first run, upserts jobs.
"""
import asyncpg
from config import DATABASE_URL

CREATE_TABLE = """
CREATE TABLE IF NOT EXISTS jobs (
    job_id          TEXT PRIMARY KEY,
    title           TEXT,
    company         TEXT,
    company_url     TEXT,
    location        TEXT,
    salary          TEXT,
    employment_type TEXT,
    seniority       TEXT,
    applicants      TEXT,
    posted_at       TEXT,
    description     TEXT,
    url             TEXT,
    source          TEXT DEFAULT 'linkedin',
    scraped_at      TIMESTAMPTZ DEFAULT NOW()
);
"""

_pool = None

async def get_pool():
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(DATABASE_URL, min_size=2, max_size=10)
        async with _pool.acquire() as conn:
            await conn.execute(CREATE_TABLE)
    return _pool

async def upsert_job(job: dict):
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute("""
            INSERT INTO jobs (job_id, title, company, company_url, location, salary,
                              employment_type, seniority, applicants, posted_at, description, url)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
            ON CONFLICT (job_id) DO UPDATE SET
                description  = EXCLUDED.description,
                applicants   = EXCLUDED.applicants,
                scraped_at   = NOW()
        """,
        job["job_id"], job["title"], job["company"], job.get("company_url"),
        job["location"], job.get("salary"), job.get("employment_type"),
        job.get("seniority"), job.get("applicants"), job.get("posted_at"),
        job.get("description"), job["url"])

async def fetch_latest(limit: int = 50, hours: int = 24):
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("""
            SELECT * FROM jobs
            WHERE scraped_at > NOW() - INTERVAL '1 hour' * $1
            ORDER BY scraped_at DESC
            LIMIT $2
        """, hours, limit)
        return [dict(r) for r in rows]
