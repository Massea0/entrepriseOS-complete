Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DEMARRAGE RAPIDE - Enterprise OS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Set environment variable
$env:NODE_ENV = "development"

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "[!] Fichier .env manquant!" -ForegroundColor Red
    Write-Host "Creation depuis .env.example..." -ForegroundColor Yellow
    
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "[!] IMPORTANT: Modifiez .env avec vos cles Supabase!" -ForegroundColor Red
        Write-Host ""
        pause
    }
}

Write-Host "[*] Demarrage du serveur..." -ForegroundColor Green
Write-Host "[*] URL: http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "[!] Ignorant les erreurs TypeScript pour un demarrage rapide" -ForegroundColor Yellow
Write-Host "[!] Appuyez sur Ctrl+C pour arreter" -ForegroundColor Gray
Write-Host ""

# Start with transpile-only to ignore TypeScript errors
npx tsx --transpile-only --env-file=.env server/index.ts