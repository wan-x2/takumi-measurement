@echo off
echo Starting Takumi Measurement System...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed.
    echo Please run scripts\install.bat first.
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo Error: Dependencies not installed.
    echo Please run scripts\install.bat first.
    pause
    exit /b 1
)

REM Check if certificates exist
if not exist "certs\server.key" (
    echo Error: SSL certificates not found.
    echo Please run scripts\install.bat first.
    pause
    exit /b 1
)

REM Check if models exist
if not exist "models\tiny_face_detector_model-weights_manifest.json" (
    echo Warning: Face detection models not found.
    echo Downloading models...
    node js\download-models.js
)

echo.
echo Starting HTTPS server...
echo.
echo Server will be available at: https://localhost:8446
echo.
echo Press Ctrl+C to stop the server.
echo.

node js\setup-https.js