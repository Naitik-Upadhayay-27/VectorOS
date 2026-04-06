# Job Scraper

Standalone LinkedIn job scraper. Not connected to the main app yet.

## Stack

- `linkedin-jobs-scraper` — headless Chrome scraping engine
- `Redis` — O(1) dedup via job ID set
- `PostgreSQL` — persistent job storage
- `APScheduler` — polls every N minutes
- `FastAPI` — test API to inspect results

## Setup

```bash
cd job_scraper
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
playwright install chromium
cp .env.example .env            # fill in your credentials
```

## Test (no DB/Redis needed)

```bash
python test_scraper.py
```

Prints scraped jobs to stdout. Uses in-memory dedup fallback.

## Run with scheduler (needs DB + Redis)

```bash
# Start Redis
docker run -d -p 6379:6379 redis

# Start Postgres
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=pass -e POSTGRES_DB=jobs_db postgres

# Update .env then:
python scheduler.py
```

## Test API

```bash
uvicorn api:app --reload --port 8001
# GET http://localhost:8001/jobs/latest
# GET http://localhost:8001/stats
```

## File structure

```
job_scraper/
├── config.py              # env vars
├── scheduler.py           # APScheduler entry point
├── api.py                 # FastAPI test server
├── test_scraper.py        # quick test, no DB needed
├── scraper/
│   ├── linkedin_scraper.py  # core scraping logic
│   └── anti_detect.py       # delays, proxies, headers
└── storage/
    ├── db.py              # PostgreSQL upsert
    └── dedup.py           # Redis seen-set
```
