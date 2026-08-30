@echo off
title INTELLIEMO - Stopping Servers

echo.
echo Stopping INTELLIEMO servers...

:: Kill by window title
taskkill /FI "WINDOWTITLE eq INTELLIEMO-Backend*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq INTELLIEMO-Frontend*" /F >nul 2>&1

:: Kill by port (236 = backend, 7036 = frontend)
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :236 ^| findstr LISTENING') do (
    echo Killing backend process PID %%a
    taskkill /PID %%a /F >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :7036 ^| findstr LISTENING') do (
    echo Killing frontend process PID %%a
    taskkill /PID %%a /F >nul 2>&1
)

echo.
echo All INTELLIEMO servers stopped.
echo.
pause
