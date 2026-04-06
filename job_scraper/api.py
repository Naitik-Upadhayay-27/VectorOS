"""
Minimal FastAPI — exposes scraped jobs for testing.

Run from job_scraper/ directory:
    uvicorn api:app --reload --port 8001
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI, Query
from storage.db import fetch_latest
from storage.dedup import seen_count

app = FastAPI(title="Job Scraper API")


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/stats")
async def stats():
    return {"total_deduped_jobs": await seen_count()}


@app.get("/jobs/latest")
async def latest_jobs(
    limit: int = Query(50, le=200),
    hours: int = Query(24, le=168),
):
    """Return jobs scraped in the last N hours."""
    jobs = await fetch_latest(limit=limit, hours=hours)
    return {"count": len(jobs), "jobs": jobs}
