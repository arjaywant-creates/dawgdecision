@echo off
echo Starting DawgDecision services...

REM 1. Environment Setup (Init)
if not exist "frontend\.env" (
    echo [Init] frontend\.env not found. Copying from frontend\.env.example...
    copy "frontend\.env.example" "frontend\.env"
    echo [Init] .env copied successfully.
)

REM 2. Start Database
echo [1/3] Starting Database...
start /b "" cmd /c "npm run db"

REM Give the database a few seconds to initialize
timeout /t 3 /nobreak >nul

REM 3. Sync Database Schema (Init / Update)
echo [Init] Syncing database schema...
call npm run db:push

REM 4. Start Backend
echo [2/3] Starting Backend...
start /b "" cmd /c "npm run backend:win"

REM 5. Start Frontend
echo [3/3] Starting Frontend...
start /b "" cmd /c "npm run dev"

echo All services started! Press Ctrl+C to stop them.
