# Generate a self-signed certificate for rivendell
$certParams = @{
    Subject = "CN=rivendell"
    DnsName = @("rivendell", "localhost", "127.0.0.1")
    KeyAlgorithm = "RSA"
    KeyLength = 2048
    HashAlgorithm = "SHA256"
    CertStoreLocation = "Cert:\CurrentUser\My"
    NotBefore = (Get-Date)
    NotAfter = (Get-Date).AddYears(5)  # Valid for 5 years
    KeyUsage = "DigitalSignature", "KeyEncipherment"
    TextExtension = @("2.5.29.37={text}1.3.6.1.5.5.7.3.1") # Server Authentication
}

# Create the certificate
$cert = New-SelfSignedCertificate @certParams

Write-Host "Certificate created with thumbprint: $($cert.Thumbprint)" -ForegroundColor Green
Write-Host "Valid from: $($cert.NotBefore)" -ForegroundColor Cyan
Write-Host "Valid until: $($cert.NotAfter)" -ForegroundColor Cyan

# Export the certificate to a PFX file with password
$password = ConvertTo-SecureString -String "rivendell-dev-password" -Force -AsPlainText
$pfxPath = Join-Path $PSScriptRoot "rivendell-cert.pfx"
Export-PfxCertificate -Cert $cert -FilePath $pfxPath -Password $password -Force

Write-Host "Certificate exported to: $pfxPath" -ForegroundColor Green

# Trust the certificate (add to Trusted Root)
$store = New-Object System.Security.Cryptography.X509Certificates.X509Store("Root", "CurrentUser")
$store.Open("ReadWrite")
$store.Add($cert)
$store.Close()

Write-Host "Certificate added to Trusted Root Certification Authorities" -ForegroundColor Green
Write-Host ""
Write-Host "Certificate Details:" -ForegroundColor Cyan
Write-Host "  Subject: $($cert.Subject)"
Write-Host "  Thumbprint: $($cert.Thumbprint)"
Write-Host "  DNS Names: rivendell, localhost, 127.0.0.1"
Write-Host "  Valid From: $($cert.NotBefore)"
Write-Host "  Valid Until: $($cert.NotAfter)"
Write-Host ""
Write-Host "To use on other machines:" -ForegroundColor Yellow
Write-Host "  1. Copy rivendell-cert.pfx to the other machine"
Write-Host "  2. Import it to Trusted Root Certification Authorities"
Write-Host "  3. Password: rivendell-dev-password"
