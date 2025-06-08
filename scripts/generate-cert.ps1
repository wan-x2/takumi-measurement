# PowerShell script to generate self-signed certificates for Windows
# Run this script as Administrator for best results

$certPath = Join-Path $PSScriptRoot "..\certs"

# Create certs directory if it doesn't exist
if (!(Test-Path $certPath)) {
    New-Item -ItemType Directory -Path $certPath -Force
}

Write-Host "Generating self-signed certificate for localhost..." -ForegroundColor Green

try {
    # Generate a self-signed certificate
    $cert = New-SelfSignedCertificate `
        -DnsName "localhost", "127.0.0.1", "::1" `
        -CertStoreLocation "Cert:\CurrentUser\My" `
        -NotAfter (Get-Date).AddYears(1) `
        -FriendlyName "Takumi Measurement System" `
        -KeyAlgorithm RSA `
        -KeyLength 2048 `
        -KeyExportPolicy Exportable

    # Export the certificate to PFX format
    $pwd = ConvertTo-SecureString -String "takumi" -Force -AsPlainText
    $pfxPath = Join-Path $certPath "server.pfx"
    Export-PfxCertificate -Cert $cert -FilePath $pfxPath -Password $pwd

    Write-Host "Certificate exported to PFX format." -ForegroundColor Green

    # Try to convert to PEM format if OpenSSL is available
    $opensslPath = Get-Command openssl -ErrorAction SilentlyContinue
    if ($opensslPath) {
        Write-Host "OpenSSL found. Converting to PEM format..." -ForegroundColor Green
        
        $keyPath = Join-Path $certPath "server.key"
        $crtPath = Join-Path $certPath "server.crt"
        
        # Convert PFX to PEM
        & openssl pkcs12 -in $pfxPath -out $keyPath -nocerts -nodes -passin pass:takumi
        & openssl pkcs12 -in $pfxPath -out $crtPath -nokeys -passin pass:takumi
        
        Write-Host "Certificates generated successfully!" -ForegroundColor Green
        Write-Host "  Private Key: $keyPath" -ForegroundColor Cyan
        Write-Host "  Certificate: $crtPath" -ForegroundColor Cyan
        
        # Remove the temporary PFX file
        Remove-Item $pfxPath -Force
    } else {
        Write-Host "OpenSSL not found. Certificate saved as PFX format." -ForegroundColor Yellow
        Write-Host "To use with Node.js, you'll need to convert it to PEM format." -ForegroundColor Yellow
        Write-Host "Install OpenSSL from: https://slproweb.com/products/Win32OpenSSL.html" -ForegroundColor Yellow
    }
    
    # Clean up - remove certificate from store
    $cert | Remove-Item
    
} catch {
    Write-Host "Error generating certificate: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`nCertificate generation complete!" -ForegroundColor Green