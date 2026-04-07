#!/bin/bash
# Deploy job scraper to EC2 — run this ON your EC2 instance
# Usage: bash deploy_ec2.sh

set -e

echo "=== Installing Python ==="
sudo apt-get update -y
sudo apt-get install -y python3 python3-venv python3-dev build-essential

echo "=== Setting up scraper ==="
cd ~/VectorOS/job_scraper

python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

echo "=== Installing PM2 (if not already) ==="
which pm2 || sudo npm install -g pm2

echo "=== Starting scraper with PM2 ==="
pm2 delete job-scraper 2>/dev/null || true
pm2 start "venv/bin/python -m uvicorn search_api:app --host 0.0.0.0 --port 8002 --workers 2" \
  --name job-scraper \
  --cwd ~/VectorOS/job_scraper \
  --interpreter none

pm2 save
pm2 startup   # follow the printed command to enable on reboot

echo ""
echo "=== Done ==="
echo "Scraper running at http://localhost:8002"
echo "Test: curl http://localhost:8002/health"
