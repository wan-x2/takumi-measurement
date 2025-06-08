@echo off
echo Takumi Measurement System Installer
echo ===================================

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed. Please install Node.js 16 or higher.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js version:
node -v

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: npm is not installed. Please install npm.
    pause
    exit /b 1
)

@REM echo npm version:
@REM npm -v 

REM Check if both certificate files exist
if not exist "certs\server.key" goto generate_certs
if not exist "certs\server.crt" goto generate_certs
goto certs_exist

:generate_certs
echo Generating SSL certificates using Git Bash...
if not exist "certs" mkdir certs

bash -c "if command -v openssl >/dev/null 2>&1; then openssl req -x509 -newkey rsa:2048 -keyout certs/server.key -out certs/server.crt -days 365 -nodes -subj '/C=JP/ST=Tokyo/L=Tokyo/O=Takumi/CN=localhost' && echo 'SSL certificates generated successfully.'; else echo 'OpenSSL not found in Git Bash'; exit 1; fi"

if %errorlevel% neq 0 (
    echo Failed to generate certificates using Git Bash.
    echo Please ensure Git for Windows is installed and in PATH.
    pause
    exit /b 1
)
goto end_cert_check

:certs_exist
echo SSL certificates already exist.

:end_cert_check

REM Download face-api.js models
echo.
echo Checking face-api.js models...
if not exist "models" mkdir models

REM Run the Node.js model downloader
echo Downloading face-api.js models...
node js\download-models.js

REM Install dependencies
echo.
echo Installing dependencies...
call npm install
pause

echo.
echo ===================================
echo Installation complete!
echo ===================================
echo.
echo To start the server, run:
echo   node js\setup-https.js
echo.
echo Then open your browser and navigate to:
echo   https://localhost:8443
echo.
echo Note: You will see a certificate warning. This is normal for self-signed certificates.
echo Click 'Advanced' and 'Proceed to localhost' to continue.
echo.