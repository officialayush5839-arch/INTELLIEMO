@echo off
title INTELLIEMO - Intelligent Emotion Detection System
color 0B

:: Ensure working directory is the script's exact directory
cd /d "%~dp0"

echo.
echo  ============================================================
echo   INTELLIEMO - Intelligent Emotion Detection System
echo   Enterprise Text Emotion Intelligence and Explainable NLP
echo  ============================================================
echo.

:: 1. Check Python installation
set "PYTHON_CMD="
python --version >nul 2>&1
if not errorlevel 1 (
    set "PYTHON_CMD=python"
) else (
    py -3 --version >nul 2>&1
    if not errorlevel 1 (
        set "PYTHON_CMD=py -3"
    )
)

if "%PYTHON_CMD%"=="" (
    echo [ERROR] Python was not detected on your system.
    echo.
    echo Please install Python 3.10 or higher from:
    echo   https://www.python.org/downloads/
    echo.
    echo IMPORTANT: Make sure to check "Add python.exe to PATH" during installation.
    echo.
    pause
    exit /b 1
)

:: 2. Check Node.js installation
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js was not detected on your system.
    echo.
    echo Please install Node.js 18 or higher from:
    echo   https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: 3. Ensure storage directories and environment files exist
if not exist "backend\data" mkdir "backend\data"

if not exist ".env" (
    if exist ".env.example" (
        echo [INFO] Creating .env from .env.example...
        copy ".env.example" ".env" >nul 2>&1
    ) else (
        echo PORT=236 > ".env"
    )
)
if not exist "backend\.env" (
    copy ".env" "backend\.env" >nul 2>&1
)

:: 4. Set up isolated Python virtual environment (backend\.venv)
if not exist "backend\.venv\Scripts\python.exe" (
    echo [1/4] Creating isolated Python virtual environment in backend\.venv...
    %PYTHON_CMD% -m venv "backend\.venv"
    if errorlevel 1 (
        echo [ERROR] Failed to create virtual environment.
        pause
        exit /b 1
    )
    echo [OK] Virtual environment created successfully.
)

:: 5. Verify & install backend dependencies
set "VENV_PYTHON=%~dp0backend\.venv\Scripts\python.exe"
set "VENV_PIP=%~dp0backend\.venv\Scripts\pip.exe"

"%VENV_PYTHON%" -c "import fastapi, uvicorn, pydantic, sqlalchemy, torch, transformers" >nul 2>&1
if errorlevel 1 (
    echo [2/4] Installing backend dependencies (PyTorch, Transformers, FastAPI)...
    echo       Note: This will download machine learning libraries and may take
    echo       a few minutes on first-time setup. Please keep this window open...
    echo.
    "%VENV_PIP%" install --upgrade pip --disable-pip-version-check
    "%VENV_PIP%" install -r "backend\requirements.txt" --disable-pip-version-check
    if errorlevel 1 (
        echo.
        echo [ERROR] Failed to install backend dependencies.
        pause
        exit /b 1
    )
    echo [OK] Backend dependencies installed.
) else (
    echo [1/4] Python virtual environment ready.
    echo [2/4] Backend dependencies verified.
)

:: 6. Verify & install frontend dependencies
if not exist "frontend\node_modules" (
    echo [3/4] Installing frontend dependencies (React 19, Tailwind, Recharts)...
    echo       Running npm install, please wait...
    echo.
    cd /d "%~dp0frontend"
    call npm install
    if errorlevel 1 (
        echo.
        echo [ERROR] Failed to install frontend npm packages.
        cd /d "%~dp0"
        pause
        exit /b 1
    )
    cd /d "%~dp0"
    echo [OK] Frontend packages installed.
) else (
    echo [3/4] Frontend node_modules verified.
)

:: 7. Free ports 236 and 7036 if occupied
echo [4/4] Allocating ports 236 (Backend) and 7036 (Frontend)...
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :236 ^| findstr LISTENING') do (
    if not "%%a"=="0" taskkill /PID %%a /F >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :7036 ^| findstr LISTENING') do (
    if not "%%a"=="0" taskkill /PID %%a /F >nul 2>&1
)
ping 127.0.0.1 -n 2 >nul

:: 8. Launch Backend in its own window
start "INTELLIEMO-Backend" cmd /k "cd /d ""%~dp0backend"" && call ""%~dp0backend\.venv\Scripts\activate.bat"" && python -m uvicorn app.main:app --host 0.0.0.0 --port 236"

:: 9. Launch Frontend in its own window
start "INTELLIEMO-Frontend" cmd /k "cd /d ""%~dp0frontend"" && npm run dev"

echo.
echo Starting servers...

:: 10. Wait for frontend to respond
echo Waiting for servers to initialize...
for /l %%i in (1, 1, 6) do (
    curl -s http://localhost:7036 >nul 2>&1
    if not errorlevel 1 goto SERVERS_READY
    ping 127.0.0.1 -n 3 >nul
)

:SERVERS_READY

echo.
echo  ============================================================
echo   INTELLIEMO IS ONLINE AND RUNNING!
echo  ============================================================
echo.
echo   [Web App]      http://localhost:7036
echo   [Backend API]  http://localhost:236
echo   [API Swagger]  http://localhost:236/docs
echo  ============================================================
echo.
echo   Opening http://localhost:7036 in your default browser...
start http://localhost:7036
echo.
echo   NOTE: Keep this terminal window open while using INTELLIEMO.
echo   To stop all servers cleanly, run stop.bat.
echo.
pause
