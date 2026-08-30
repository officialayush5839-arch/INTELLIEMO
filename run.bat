@echo off
title INTELLIEMO - Intelligent Emotion Detection System
color 0B

:: Ensure working directory is the script's directory
cd /d "%~dp0"

echo.
echo  ============================================================
echo   INTELLIEMO - Intelligent Emotion Detection System
echo   An Intelligent Emotion Detection System from Text
echo   Using NLP and Deep Learning
echo  ============================================================
echo.

:: Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Install Python 3.10+ from python.org and add it to PATH.
    pause
    exit /b 1
)

:: Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Install Node.js 18+ from nodejs.org and add it to PATH.
    pause
    exit /b 1
)

:: Create backend data directory if missing
if not exist "backend\data" mkdir "backend\data"

:: Ensure .env exists in project root and backend
if not exist ".env" (
    echo [INFO] Creating .env from template...
    copy ".env.example" ".env" >nul 2>&1
)
if not exist "backend\.env" (
    copy ".env" "backend\.env" >nul 2>&1
)

:: Fast-check backend dependencies (only install if missing)
echo [1/3] Checking dependencies...
python -c "import fastapi, uvicorn, pydantic, sqlalchemy" >nul 2>&1
if errorlevel 1 (
    echo [INFO] Installing backend dependencies...
    cd backend
    pip install -r requirements.txt --quiet --disable-pip-version-check
    cd ..
)

:: Fast-check frontend dependencies (only install if node_modules missing)
if not exist "frontend\node_modules" (
    echo [INFO] Installing frontend dependencies...
    cd frontend
    call npm install --silent
    cd ..
)
echo [OK] Dependencies ready.
echo.

:: Free up ports 236 and 7036 if currently in use
echo [2/3] Preparing ports Backend 236 and Frontend 7036...
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :236 ^| findstr LISTENING') do (
    if not "%%a"=="0" taskkill /PID %%a /F >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :7036 ^| findstr LISTENING') do (
    if not "%%a"=="0" taskkill /PID %%a /F >nul 2>&1
)
ping 127.0.0.1 -n 2 >nul

:: Start Backend server on port 236
echo [3/3] Starting backend and frontend servers...
cd backend
start "INTELLIEMO-Backend" cmd /k "python -m uvicorn app.main:app --host 0.0.0.0 --port 236"
cd ..

:: Start Frontend server on port 7036
cd frontend
start "INTELLIEMO-Frontend" cmd /k "npm run dev"
cd ..

:: Brief wait for servers to initialize
ping 127.0.0.1 -n 4 >nul

echo.
echo  ============================================================
echo   INTELLIEMO IS RUNNING!
echo  ============================================================
echo.
echo   Frontend Web App:  http://localhost:7036
echo   Backend REST API:  http://localhost:236
echo   API Documentation: http://localhost:236/docs
echo  ============================================================
echo.
echo   Opening http://localhost:7036 in your browser...
start http://localhost:7036
echo.
echo   Keep this window open while using INTELLIEMO.
echo   To stop all servers, run stop.bat or close this window.
echo.

:: Keep window open
pause
