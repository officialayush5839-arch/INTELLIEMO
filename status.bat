@echo off
title INTELLIEMO - Server Status

echo.
echo  INTELLIEMO Server Status
echo  ========================
echo.

:: Check backend
curl -s http://localhost:236/api/v1/health >nul 2>&1
if errorlevel 1 (
    echo  Backend (port 236):   OFFLINE
) else (
    echo  Backend (port 236):   ONLINE
    curl -s http://localhost:236/api/v1/health 2>nul
    echo.
)

:: Check frontend
curl -s http://localhost:7036 >nul 2>&1
if errorlevel 1 (
    echo  Frontend (port 7036): OFFLINE
) else (
    echo  Frontend (port 7036): ONLINE
)

echo.
pause
