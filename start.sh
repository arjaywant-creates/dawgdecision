#!/bin/bash

echo "Starting DawgDecision services..."

# Cleanly shut down all child processes when the script exits
trap 'kill $(jobs -p) 2>/dev/null; exit' EXIT INT TERM

# 1. Environment Setup (Init)
if [ ! -f "frontend/.env" ]; then
    echo "[Init] frontend/.env not found. Copying from frontend/.env.example..."
    cp frontend/.env.example frontend/.env
    echo "[Init] .env copied successfully."
fi

# 2. Start Database
echo "[1/3] Starting Database..."
npm run db &

# Give the database a few seconds to initialize
sleep 2

# 3. Sync Database Schema (Init / Update)
echo "[Init] Syncing database schema..."
npm run db:push

# 4. Start Backend
echo "[2/3] Starting Backend..."
npm run backend &

# 5. Start Frontend
echo "[3/3] Starting Frontend..."
npm run dev &

echo "All services started. Press Ctrl+C to stop all."
wait
