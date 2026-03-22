#!/bin/bash
set -e

APP_DIR=$(pwd)
APP_NAME="oscabe-ai"

echo "=== OSCABE AI Deployment ==="

# Find free port
PORT=$(bash scripts/find-free-port.sh)
echo "Using port: $PORT"

# Write port to .env.local
sed -i "s/^PORT=.*/PORT=$PORT/" .env.local 2>/dev/null || echo "PORT=$PORT" >> .env.local

# Install dependencies
npm ci

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Build
npm run build

# Restart PM2 process
pm2 delete $APP_NAME 2>/dev/null || true
PORT=$PORT pm2 start ecosystem.config.js
pm2 save

echo ""
echo "=== OSCABE AI deployed successfully ==="
echo "Running on port: $PORT"
echo "Process: pm2 status $APP_NAME"
echo ""
echo "Next steps:"
echo "1. Configure Nginx to proxy to localhost:$PORT"
echo "2. Set up SSL with Let's Encrypt"
echo "3. Verify: curl http://localhost:$PORT"
