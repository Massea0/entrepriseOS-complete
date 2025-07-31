# Enterprise OS - Script de démarrage Windows
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "  ENTERPRISE OS - DEMARRAGE WINDOWS" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier la version de Node.js
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERREUR] Node.js n'est pas installé!" -ForegroundColor Red
    Write-Host "Téléchargez Node.js depuis : https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}
Write-Host "[OK] Node.js $nodeVersion trouvé" -ForegroundColor Green

# Vérifier si node_modules existe
if (!(Test-Path "node_modules")) {
    Write-Host "[!] node_modules manquant - Installation des dépendances..." -ForegroundColor Yellow
    Write-Host ""
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERREUR] L'installation a échoué!" -ForegroundColor Red
        exit 1
    }
    Write-Host ""
}

# Vérifier si .env existe
if (!(Test-Path ".env")) {
    Write-Host "[!] Fichier .env manquant - Création..." -ForegroundColor Yellow
    @"
# Database - Supabase
NEXT_PUBLIC_SUPABASE_URL=https://qlqgyrfqiflnqknbtycw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE1NzkwNTAsImV4cCI6MjA0NzE1NTA1MH0.xE-ws_IkXJBMV5fwEAZhPFkjHDbN5JrXyj88QmE6kKg
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDEwMjQ1MSwiZXhwIjoyMDY1Njc4NDUxfQ.hjJN_YGXtGETh6ks2mAJ0wmwYDcATrTJCihG1aV8ppc

# Gemini API
GEMINI_API_KEY=AIzaSyDK2aFPChQ_7pLy1J2IRQmhK_g4inUqWiU

# WebSocket URL
NEXT_PUBLIC_GEMINI_VOICE_WS_URL=wss://qlqgyrfqiflnqknbtycw.supabase.co/functions/v1/gemini-live-voice-enhanced
"@ | Out-File -FilePath .env -Encoding UTF8
    Write-Host "[OK] Fichier .env créé" -ForegroundColor Green
}

# Vérifier le port 5000
$port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($port5000) {
    Write-Host "[!] Le port 5000 est déjà utilisé!" -ForegroundColor Yellow
    Write-Host "    PID utilisant le port : $($port5000[0].OwningProcess)" -ForegroundColor Yellow
    $response = Read-Host "Voulez-vous tuer ce processus? (O/N)"
    if ($response -eq "O") {
        Stop-Process -Id $port5000[0].OwningProcess -Force
        Write-Host "[OK] Processus arrêté" -ForegroundColor Green
    }
}

# Définir NODE_ENV
$env:NODE_ENV = "development"

# Afficher les informations
Write-Host ""
Write-Host "[i] L'application sera disponible sur : " -NoNewline
Write-Host "http://localhost:5000" -ForegroundColor Green
Write-Host "[i] API disponible sur : " -NoNewline
Write-Host "http://localhost:5000/api/*" -ForegroundColor Green
Write-Host ""
Write-Host "[i] Utilisateurs de test :" -ForegroundColor Cyan
Write-Host "    - Admin : ddjily60@gmail.com" -ForegroundColor White
Write-Host "    - Admin avec company : mdiouf@arcadis.tech" -ForegroundColor White
Write-Host ""
Write-Host "[i] Appuyez sur Ctrl+C pour arrêter le serveur" -ForegroundColor Yellow
Write-Host ""

# Démarrer le serveur
try {
    npx tsx --env-file=.env server/index.ts
} catch {
    Write-Host "[ERREUR] Une erreur s'est produite : $_" -ForegroundColor Red
}

pause