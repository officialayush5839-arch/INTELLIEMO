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

:: 1. Verify Node.js installation
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js was not detected on your system.
    echo.
    echo Please install Node.js 18 or higher from:
    echo   https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: 2. Identify or verify Python executable
set "PYTHON_CMD="

:: First check if virtual environment already exists and works
if exist "%~dp0backend\.venv\Scripts\python.exe" (
    "%~dp0backend\.venv\Scripts\python.exe" -c "import sys" >nul 2>&1
    if not errorlevel 1 (
        set "PYTHON_CMD=%~dp0backend\.venv\Scripts\python.exe"
        goto PYTHON_READY
    )
)

:: If virtualenv doesn't exist yet, search for a working system Python.
:: Note: Do not use 'python --version' alone, as WindowsApps stub returns exit code 0.
:: Always verify execution with -c "import sys".
py -3 -c "import sys" >nul 2>&1
if not errorlevel 1 (
    set "PYTHON_CMD=py -3"
    goto PYTHON_FOUND
)

python -c "import sys" >nul 2>&1
if not errorlevel 1 (
    set "PYTHON_CMD=python"
    goto PYTHON_FOUND
)

py -c "import sys" >nul 2>&1
if not errorlevel 1 (
    set "PYTHON_CMD=py"
    goto PYTHON_FOUND
)

:: Check common Windows Python install locations
for %%p in (
    "%LOCALAPPDATA%\Python\pythoncore-3.14-64\python.exe"
    "%LOCALAPPDATA%\Programs\Python\Python313\python.exe"
    "%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
    "%LOCALAPPDATA%\Programs\Python\Python311\python.exe"
    "%LOCALAPPDATA%\Programs\Python\Python310\python.exe"
    "%ProgramFiles%\Python312\python.exe"
    "%ProgramFiles%\Python311\python.exe"
    "%ProgramFiles%\Python310\python.exe"
) do (
    if exist %%p (
        %%p -c "import sys" >nul 2>&1
        if not errorlevel 1 (
            set "PYTHON_CMD=%%p"
            goto PYTHON_FOUND
        )
    )
)

if "%PYTHON_CMD%"=="" (
    echo [ERROR] A valid Python interpreter was not detected on your system.
    echo.
    echo Please install Python 3.10 or higher from:
    echo   https://www.python.org/downloads/
    echo.
    echo IMPORTANT: Make sure to check "Add python.exe to PATH" during installation,
    echo and ensure "Python" is not pointing to an empty Windows App Alias.
    echo.
    pause
    exit /b 1
)

:PYTHON_FOUND
:: 3. Create virtual environment if it doesn't exist
if not exist "%~dp0backend\.venv\Scripts\python.exe" (
    echo [1/4] Creating isolated Python virtual environment in backend\.venv...
    %PYTHON_CMD% -m venv "%~dp0backend\.venv"
    if errorlevel 1 (
        echo [ERROR] Failed to create virtual environment.
        pause
        exit /b 1
    )
    echo [OK] Virtual environment created successfully.
)

:PYTHON_READY
set "VENV_PYTHON=%~dp0backend\.venv\Scripts\python.exe"

:: 4. Ensure storage directories and environment files exist
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

:: 5. Verify & install backend dependencies
"%VENV_PYTHON%" -c "import fastapi, uvicorn, pydantic, sqlalchemy, torch, transformers" >nul 2>&1
if errorlevel 1 (
    echo [2/4] Installing backend dependencies (PyTorch, Transformers, FastAPI)...
    echo       Note: This will download machine learning libraries and may take
    echo       a few minutes on first-time setup. Please keep this window open...
    echo.
    "%VENV_PYTHON%" -m pip install --upgrade pip --disable-pip-version-check
    "%VENV_PYTHON%" -m pip install -r "backend\requirements.txt" --disable-pip-version-check
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
    echo [3/4] Installing frontend dependencies (React, Vite, Tailwind, Recharts)...
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
start "INTELLIEMO-Backend" cmd /k "call "%~dp0backend\start.bat""

:: 9. Launch Frontend in its own window
start "INTELLIEMO-Frontend" cmd /k "call "%~dp0frontend\start.bat""

echo.
echo Starting servers...

:: 10. Wait for frontend and backend to initialize
echo Waiting for servers to initialize...
for /l %%i in (1, 1, 8) do (
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
