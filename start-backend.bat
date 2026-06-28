@echo off
echo.
echo ===================================================
echo  SupportMind Backend Startup
echo ===================================================
echo.

REM Navigate to backend directory
cd /d "%~dp0"

REM Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found. Install Python 3.11+ from https://python.org
    pause
    exit /b 1
)

REM Create virtual environment if it doesn't exist
if not exist "backend\venv" (
    echo [1/3] Creating Python virtual environment...
    python -m venv backend\venv
)

REM Activate venv and install dependencies
echo [2/3] Installing dependencies...
call backend\venv\Scripts\activate.bat
pip install -r backend\requirements.txt --quiet

REM Copy .env if it doesn't exist
if not exist "backend\.env" (
    echo [INFO] Creating backend\.env from template...
    copy backend\.env.example backend\.env
    echo [ACTION REQUIRED] Edit backend\.env and add AI_PROVIDER_API_KEY if you want live AI responses
)

REM Seed database
echo [3/3] Seeding database with demo data...
python backend\seed.py

echo.
echo [STARTING] SupportMind Backend on http://localhost:8000
echo [DOCS]     API Documentation at http://localhost:8000/docs
echo.

REM Run FastAPI
python -m uvicorn backend.app:app --host 0.0.0.0 --port 8000 --reload
