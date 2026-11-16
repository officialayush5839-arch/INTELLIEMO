@echo off
title INTELLIEMO - Model Training & Evaluation
color 0E

:: Ensure working directory is the script's directory (where ml/ is located)
cd /d "%~dp0"

echo.
echo  ============================================================
echo   INTELLIEMO - Model Training & Evaluation Pipeline
echo  ============================================================
echo   Trains baseline models (Logistic Regression, SVM) and
echo   benchmarks the high-accuracy DistilBERT emotion model.
echo  ============================================================
echo.

:: Identify Python executable
set "PY_CMD="

if exist "%~dp0backend\.venv\Scripts\python.exe" (
    set "PY_CMD=%~dp0backend\.venv\Scripts\python.exe"
) else (
    py -3 -c "import sys" >nul 2>&1
    if not errorlevel 1 (
        set "PY_CMD=py -3"
    ) else (
        python -c "import sys" >nul 2>&1
        if not errorlevel 1 (
            set "PY_CMD=python"
        ) else (
            echo [ERROR] A valid Python interpreter was not detected in PATH.
            pause
            exit /b 1
        )
    )
)

echo [1/3] Checking hardware acceleration...
"%PY_CMD%" -c "import torch; print(f'  CUDA GPU: {torch.cuda.is_available()} | Device: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else \"CPU\"}')"
echo.

echo [2/3] Checking training dependencies...
"%PY_CMD%" -c "import datasets, sklearn, transformers, torch" >nul 2>&1
if errorlevel 1 (
    echo [INFO] Installing required dependencies...
    "%PY_CMD%" -m pip install datasets scikit-learn transformers torch --disable-pip-version-check
)
echo [OK] Dependencies ready.
echo.

echo [3/3] Starting model training and benchmarking...
echo.
"%PY_CMD%" -m ml.training.train

echo.
echo  ============================================================
echo   Training and evaluation complete!
echo   Metrics saved to: models/emotion_model/
echo   View updated metrics and comparison charts at:
echo   http://localhost:7036/dashboard/model
echo  ============================================================
echo.

pause
