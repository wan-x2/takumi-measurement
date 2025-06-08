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

echo npm version:
npm -v

REM Install dependencies
echo.
echo Installing dependencies...
call npm install

REM Check if OpenSSL is installed
where openssl >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo Warning: OpenSSL is not installed or not in PATH.
    echo We'll try to generate certificates anyway...
)

REM Generate SSL certificates if they don't exist
if not exist "certs\server.key" (
    echo.
    echo Generating SSL certificates...
    if not exist "certs" mkdir certs
    
    REM Try OpenSSL first
    where openssl >nul 2>nul
    if %errorlevel% equ 0 (
        openssl req -x509 -newkey rsa:2048 -keyout certs\server.key -out certs\server.crt -days 365 -nodes -subj "/C=JP/ST=Tokyo/L=Tokyo/O=Takumi/CN=localhost"
    ) else (
        REM If OpenSSL not available, use PowerShell to generate self-signed certificate
        echo OpenSSL not found. Using PowerShell to generate certificates...
        powershell -Command "$cert = New-SelfSignedCertificate -DnsName 'localhost' -CertStoreLocation 'Cert:\CurrentUser\My' -NotAfter (Get-Date).AddYears(1); $pwd = ConvertTo-SecureString -String 'password' -Force -AsPlainText; Export-PfxCertificate -Cert $cert -FilePath 'certs\temp.pfx' -Password $pwd; $cert | Remove-Item"
        
        REM Note: PowerShell method creates PFX, would need conversion to PEM
        echo.
        echo Note: PowerShell certificate generation requires additional conversion.
        echo For best results, please install OpenSSL and run this script again.
        echo Download OpenSSL from: https://slproweb.com/products/Win32OpenSSL.html
    )
    
    if exist "certs\server.key" (
        echo SSL certificates generated successfully.
    )
) else (
    echo SSL certificates already exist.
)

REM Download face-api.js models
echo.
echo Checking face-api.js models...
if not exist "models" mkdir models

REM Run the Node.js model downloader
echo Downloading face-api.js models...
node js\download-models.js

REM Create placeholder directories
echo.
echo Creating placeholder directories...
if not exist "image" mkdir image
if not exist "sound" mkdir sound

REM Check for required images
if not exist "image\c.png" (
    echo.
    echo Note: Please add a cat image at image\c.png
    echo You can download one from the original repository or use any cat image.
)

REM Check for irritating images
set missing_images=0
if not exist "image\irritating1.png" set /a missing_images+=1
if not exist "image\irritating2.png" set /a missing_images+=1
if not exist "image\irritating3.png" set /a missing_images+=1

if %missing_images% gtr 0 (
    echo Note: Please add %missing_images% irritating image(s) in the image folder
    echo Files needed: irritating1.png, irritating2.png, irritating3.png
)

REM Check for background music
if not exist "sound\backmusic.mp3" (
    echo Note: Please add background music at sound\backmusic.mp3
    echo The system will work without it, but the experience will be limited.
)

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
pause