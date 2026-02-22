$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$appDir = Join-Path $scriptDir "app-v3"

Write-Host "Building Upwork Job Scraper..." -ForegroundColor Cyan

Push-Location $appDir
try {
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Build failed." -ForegroundColor Red
        exit 1
    }
} finally {
    Pop-Location
}

$outputPath = Join-Path $appDir ".output\chrome-mv3"
Write-Host ""
Write-Host "Build complete." -ForegroundColor Green
Write-Host "Load or reload this folder in Chrome:" -ForegroundColor Yellow
Write-Host "  $outputPath" -ForegroundColor White
Write-Host ""
Write-Host "  1. Open chrome://extensions" -ForegroundColor Gray
Write-Host "  2. Enable Developer mode" -ForegroundColor Gray
Write-Host "  3. Click 'Load unpacked' and select the path above" -ForegroundColor Gray
Write-Host "  4. If already loaded, click the refresh icon on the extension card" -ForegroundColor Gray
