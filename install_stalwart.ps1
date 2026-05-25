# Create directories
$baseDir = "c:\Users\aman7\Desktop\AI\stalwart"
if (!(Test-Path $baseDir)) {
    New-Item -ItemType Directory -Path "$baseDir\bin", "$baseDir\etc", "$baseDir\data", "$baseDir\logs" -Force
}

# Download Stalwart (v0.16.2)
$url = "https://github.com/stalwartlabs/mail-server/releases/download/v0.16.2/stalwart-x86_64-pc-windows-msvc.zip"
$zipPath = "$baseDir\stalwart.zip"
Write-Host "Downloading Stalwart from $url..."
try {
    Invoke-WebRequest -Uri $url -OutFile $zipPath
} catch {
    Write-Error "Failed to download Stalwart. Please check your internet connection."
    exit
}

# Extract
Write-Host "Extracting..."
try {
    Expand-Archive -Path $zipPath -DestinationPath "$baseDir\bin" -Force
} catch {
    Write-Error "Failed to extract Stalwart."
    exit
}
Remove-Item $zipPath

# Create a basic start script
$startScript = @"
@echo off
cd bin
stalwart-mail.exe --etc ..\etc
"@
$startScript | Out-File -FilePath "$baseDir\start.cmd" -Encoding ascii

Write-Host "`nStalwart installed successfully to $baseDir"
Write-Host "------------------------------------------------"
Write-Host "1. Run '.\stalwart\start.cmd' to start the server."
Write-Host "2. Open http://localhost:8080 in your browser to complete setup."
Write-Host "------------------------------------------------"
