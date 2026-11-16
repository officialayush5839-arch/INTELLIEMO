@echo off
title INTELLIEMO - Backend Service (Port 236)
cd /d "%~dp0"

if exist "%~dp0.venv\Scripts\python.exe" (
    set "PY_EXE=%~dp0.venv\Scripts\python.exe"
) else (
    set "PY_EXE=python"
)

echo Starting INTELLIEMO Backend on http://0.0.0.0:236 ...
"%PY_EXE%" -m uvicorn app.main:app --host 0.0.0.0 --port 236
