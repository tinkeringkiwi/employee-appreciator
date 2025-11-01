#!/usr/bin/env bash
set -euo pipefail

# Start the Python backend and the Next.js frontend in the same container.
# This script starts both services in the background and waits for any to exit.

echo "Starting backend (Flask)..."
python /app/backend/main.py &
BACKEND_PID=$!

echo "Starting frontend (Next.js)..."
npm run start &
FRONTEND_PID=$!

echo "Both processes started: backend=$BACKEND_PID frontend=$FRONTEND_PID"

wait -n $BACKEND_PID $FRONTEND_PID
EXIT_CODE=$?

echo "A process exited with code $EXIT_CODE, shutting down."
kill -TERM $BACKEND_PID 2>/dev/null || true
kill -TERM $FRONTEND_PID 2>/dev/null || true
wait || true
exit $EXIT_CODE
