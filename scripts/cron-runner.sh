#!/bin/bash
# OSCABE AI — Cron Job Runner
# Calls the Next.js cron API endpoints
# Usage: ./cron-runner.sh <job-name>

BASE_URL="${OSCABE_BASE_URL:-http://localhost:3000}"
CRON_KEY="${CRON_SECRET:-}"

JOB=$1

if [ -z "$JOB" ]; then
  echo "Usage: $0 <sync-metrics|sync-replies|domain-health|weekly-discover|daily-digest>"
  exit 1
fi

URL="${BASE_URL}/api/outreach/cron/${JOB}?key=${CRON_KEY}"

echo "[$(date)] Running cron job: ${JOB}"
curl -s -o /dev/null -w "HTTP %{http_code}" "${URL}"
echo ""
echo "[$(date)] Done: ${JOB}"
