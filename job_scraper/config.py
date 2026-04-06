import os
from dotenv import load_dotenv

load_dotenv()

LINKEDIN_EMAIL    = os.getenv("LINKEDIN_EMAIL", "")
LINKEDIN_PASSWORD = os.getenv("LINKEDIN_PASSWORD", "")

REDIS_URL    = os.getenv("REDIS_URL", "redis://localhost:6379")
DATABASE_URL = os.getenv("DATABASE_URL", "")

SEARCH_QUERIES   = [q.strip() for q in os.getenv("SEARCH_QUERIES", "Software Engineer").split(",")]
SEARCH_LOCATION  = os.getenv("SEARCH_LOCATION", "United States")
MAX_JOBS_PER_RUN = int(os.getenv("MAX_JOBS_PER_RUN", "50"))
POLL_INTERVAL    = int(os.getenv("POLL_INTERVAL_MINUTES", "30"))

PROXY_LIST = [p.strip() for p in os.getenv("PROXY_LIST", "").split(",") if p.strip()]

# Anti-detection
MIN_DELAY = 1.5   # seconds between requests
MAX_DELAY = 3.5
BACKOFF_ON_BLOCK = 90  # seconds to wait on 429/CAPTCHA
MAX_RETRIES = 3
