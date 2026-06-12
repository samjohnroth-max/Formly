#!/bin/bash
set -e

# Run database migrations synchronously before starting any process.
# This ensures schema is current before the web app or workers connect.
echo "[start] Running database migrations..."
npm run db:migrate
echo "[start] Migrations complete. Starting all services..."

# Launch all three processes under concurrently.
# --kill-others-on-fail: if any process exits with a non-zero code,
#   kill the rest so Railway's restart policy fires for the whole service.
# --prefix-colors: colour-coded log prefixes for readability in Railway's log stream.
exec ./node_modules/.bin/concurrently \
  --kill-others-on-fail \
  --prefix "[{name}]" \
  --names "web,worker,st-jobs" \
  --prefix-colors "cyan.bold,green.bold,yellow.bold" \
  "npm start" \
  "tsx src/worker.ts" \
  "tsx src/worker-st-jobs.ts"
