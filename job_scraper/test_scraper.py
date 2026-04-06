"""
Quick test — runs one scrape, prints full job details.
No DB/Redis required.

Usage:
    cd job_scraper
    python test_scraper.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

os.environ.setdefault("SEARCH_QUERIES", "Python Developer")
os.environ.setdefault("SEARCH_LOCATION", "Remote")
os.environ.setdefault("MAX_JOBS_PER_RUN", "25")

import storage.db as db_module

async def _mock_upsert(job: dict):
    desc = (job.get('description') or '').strip()
    print(f"\n{'='*60}")
    print(f"  Title:       {job['title']}")
    print(f"  Company:     {job['company']}")
    print(f"  Location:    {job['location']}")
    print(f"  Type:        {job.get('employment_type') or 'N/A'}")
    print(f"  Seniority:   {job.get('seniority') or 'N/A'}")
    print(f"  Posted:      {job.get('posted_at') or 'N/A'}")
    print(f"  ID:          {job['job_id']}")
    print(f"  URL:         {job.get('url', '')}")
    print(f"\n  Description:\n")
    # Print full description, wrapped at 80 chars
    for line in desc.split('\n'):
        line = line.strip()
        if line:
            print(f"    {line}")
    print(f"{'='*60}")

db_module.upsert_job = _mock_upsert

from scraper.linkedin_scraper import run_scraper

if __name__ == "__main__":
    print("=" * 60)
    print("  LinkedIn Scraper — Test Run")
    print("  Query:    Python Developer")
    print("  Location: Remote")
    print("  Limit:    25 jobs (latest 24h)")
    print("=" * 60)

    stats = run_scraper(force=True)   # bypass off-peak check for testing

    print(f"\n{'='*60}")
    print(f"  Done — scraped: {stats['scraped']}, "
          f"skipped: {stats['skipped']}, errors: {stats['errors']}")
    print("=" * 60)
