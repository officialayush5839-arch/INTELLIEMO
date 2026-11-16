@echo off
title INTELLIEMO - Frontend Service (Port 7036)
cd /d "%~dp0"

echo Starting INTELLIEMO Frontend on http://localhost:7036 ...
call npm run dev
