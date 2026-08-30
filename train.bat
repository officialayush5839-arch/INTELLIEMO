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

:: Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH.
    pause
    exit /b 1
)

echo [1/3] Checking hardware acceleration...
python -c "import torch; print(f'  CUDA GPU: {torch.cuda.is_available()} | Device: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else \"CPU\"}')"
echo.

echo [2/3] Checking training dependencies...
python -c "import datasets, sklearn, transformers, torch" >nul 2>&1
if errorlevel 1 (
    echo [INFO] Installing required dependencies...
    pip install datasets scikit-learn transformers torch --quiet --disable-pip-version-check
)
echo [OK] Dependencies ready.
echo.

echo [3/3] Starting model training and benchmarking...
echo.
python -m ml.training.train

echo.
echo  ============================================================
echo   Training and evaluation complete!
echo   Metrics saved to: models/emotion_model/
echo   View the updated metrics and comparison charts at:
echo   http://localhost:7036/model
echo  ============================================================
echo.

pause
