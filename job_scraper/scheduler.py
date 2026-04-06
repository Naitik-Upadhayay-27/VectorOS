"""
APScheduler — runs the scraper every POLL_INTERVAL minutes.

Run from job_scraper/ directory:
    python scheduler.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.interval import IntervalTrigger
from scraper.linkedin_scraper import run_scraper
from config import POLL_INTERVAL
import logging

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("scheduler")


def job():
    log.info("=== Starting scrape run ===")
    try:
        stats = run_scraper()
        log.info(f"=== Run done: {stats} ===")
    except Exception as e:
        log.error(f"Scrape run failed: {e}", exc_info=True)


if __name__ == "__main__":
    log.info(f"Scheduler starting — interval: {POLL_INTERVAL} minutes")

    # Run once immediately on start
    job()

    scheduler = BlockingScheduler()
    scheduler.add_job(
        job,
        trigger="cron",
        hour="2-5",          # runs every hour between 2am–5am
        minute=0,
        id="linkedin_scraper",
        name="LinkedIn Job Scraper (off-peak)",
        misfire_grace_time=300,
    )
    scheduler.start()
