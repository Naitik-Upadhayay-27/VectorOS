// PM2 ecosystem config for job scraper
module.exports = {
  apps: [{
    name:        'job-scraper',
    script:      'venv/bin/python',
    args:        '-m uvicorn search_api:app --host 0.0.0.0 --port 8002 --workers 2',
    cwd:         '/home/ubuntu/VectorOS/job_scraper',  // adjust if needed
    interpreter: 'none',
    env: {
      PYTHONUNBUFFERED: '1',
    },
    // Restart if it crashes
    autorestart:  true,
    watch:        false,
    max_memory_restart: '300M',
    // Logs
    out_file:  './logs/scraper-out.log',
    error_file:'./logs/scraper-err.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
  }]
}
