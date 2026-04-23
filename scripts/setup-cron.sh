#!/bin/bash
# =============================================================================
# Oscabe Automation — VPS Cron Setup
# =============================================================================
# Sets up cron jobs on the VPS to call the automation endpoint at scheduled
# times (UK timezone). Run this once on the production server.
#
# Usage:
#   chmod +x scripts/setup-cron.sh
#   sudo ./scripts/setup-cron.sh
# =============================================================================

set -euo pipefail

ENV_FILE="/var/www/oscabe-ai/.env.local"
DOMAIN="https://oscabe.com"

# Generate a random cron secret if one doesn't already exist
if grep -q "AUTOMATION_CRON_SECRET" "$ENV_FILE" 2>/dev/null; then
  echo "AUTOMATION_CRON_SECRET already exists in $ENV_FILE"
  CRON_SECRET=$(grep "AUTOMATION_CRON_SECRET" "$ENV_FILE" | cut -d'=' -f2)
else
  CRON_SECRET=$(openssl rand -hex 16)
  echo "AUTOMATION_CRON_SECRET=$CRON_SECRET" >> "$ENV_FILE"
  echo "Generated new AUTOMATION_CRON_SECRET and added to $ENV_FILE"
fi

ENDPOINT="${DOMAIN}/api/automation/cron?secret=${CRON_SECRET}"

echo ""
echo "Setting up cron jobs for: $ENDPOINT"
echo ""

# Remove any existing oscabe automation cron entries
crontab -l 2>/dev/null | grep -v "/api/automation/cron" > /tmp/oscabe_cron_clean 2>/dev/null || true

# Add the new cron jobs (server time should be UTC; cron times are UK time)
# Monday 08:00 UK → discover
echo "0 8 * * 1 curl -s \"${ENDPOINT}\" > /dev/null 2>&1 # oscabe:discover" >> /tmp/oscabe_cron_clean
# Mon-Fri 08:30 UK → verify
echo "30 8 * * 1-5 curl -s \"${ENDPOINT}\" > /dev/null 2>&1 # oscabe:verify" >> /tmp/oscabe_cron_clean
# Mon-Fri 09:30 UK → outreach
echo "30 9 * * 1-5 curl -s \"${ENDPOINT}\" > /dev/null 2>&1 # oscabe:outreach" >> /tmp/oscabe_cron_clean
# Mon-Fri 14:00 UK → followup
echo "0 14 * * 1-5 curl -s \"${ENDPOINT}\" > /dev/null 2>&1 # oscabe:followup" >> /tmp/oscabe_cron_clean
# Mon-Fri 15:00 UK → classify
echo "0 15 * * 1-5 curl -s \"${ENDPOINT}\" > /dev/null 2>&1 # oscabe:classify" >> /tmp/oscabe_cron_clean
# Mon-Fri 17:00 UK → report
echo "0 17 * * 1-5 curl -s \"${ENDPOINT}\" > /dev/null 2>&1 # oscabe:report" >> /tmp/oscabe_cron_clean

crontab /tmp/oscabe_cron_clean
rm /tmp/oscabe_cron_clean

echo "Cron jobs installed:"
echo ""
crontab -l | grep "oscabe"
echo ""
echo "Done. The automation engine will run on the schedule above."
echo "To verify, check: curl \"${ENDPOINT}\""
