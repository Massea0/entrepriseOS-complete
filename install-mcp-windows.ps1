# Script d'installation MCP pour Cursor sur Windows
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Installation MCP Supabase - Windows" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si Cursor est installé
$cursorPath = "$env:LOCALAPPDATA\Programs\cursor\Cursor.exe"
if (-not (Test-Path $cursorPath)) {
    Write-Host "[ERREUR] Cursor n'est pas installé ou n'est pas dans le chemin par défaut" -ForegroundColor Red
    Write-Host "Chemin attendu: $cursorPath" -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] Cursor détecté" -ForegroundColor Green

# Créer le dossier de configuration
$configPath = "$env:APPDATA\Cursor\User"
if (-not (Test-Path $configPath)) {
    Write-Host "[INFO] Création du dossier de configuration..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $configPath -Force | Out-Null
}

# Vérifier si mcp-config.json existe dans le projet
$sourceConfig = "./mcp-config.json"
if (-not (Test-Path $sourceConfig)) {
    Write-Host "[ERREUR] mcp-config.json n'existe pas dans le répertoire actuel" -ForegroundColor Red
    Write-Host "Assurez-vous d'être dans le dossier du projet" -ForegroundColor Yellow
    exit 1
}

# Copier la configuration
$targetConfig = "$configPath\mcp.json"
Write-Host "[INFO] Copie de la configuration MCP..." -ForegroundColor Yellow
Copy-Item -Path $sourceConfig -Destination $targetConfig -Force

Write-Host "[OK] Configuration copiée vers: $targetConfig" -ForegroundColor Green

# Vérifier si le serveur MCP Supabase est installé
Write-Host ""
Write-Host "[INFO] Test du serveur MCP Supabase..." -ForegroundColor Yellow
$testResult = npx -y @modelcontextprotocol/server-supabase --version 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Serveur MCP Supabase disponible" -ForegroundColor Green
} else {
    Write-Host "[AVERTISSEMENT] Le serveur MCP sera téléchargé au premier lancement" -ForegroundColor Yellow
}

# Instructions finales
Write-Host ""
Write-Host "====================================" -ForegroundColor Green
Write-Host "      Installation terminée !       " -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Prochaines étapes:" -ForegroundColor Cyan
Write-Host "1. Fermez complètement Cursor (toutes les fenêtres)" -ForegroundColor White
Write-Host "2. Redémarrez Cursor" -ForegroundColor White
Write-Host "3. Dans une nouvelle conversation, vous devriez voir:" -ForegroundColor White
Write-Host "   '🟢 MCP Connected: supabase'" -ForegroundColor Green
Write-Host ""
Write-Host "Commandes MCP disponibles:" -ForegroundColor Cyan
Write-Host "- mcp_supabase_query    : Requêtes SQL" -ForegroundColor White
Write-Host "- mcp_supabase_insert   : Insérer des données" -ForegroundColor White
Write-Host "- mcp_supabase_update   : Mettre à jour" -ForegroundColor White
Write-Host "- mcp_supabase_delete   : Supprimer" -ForegroundColor White
Write-Host "- mcp_supabase_rpc      : Appeler des fonctions" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  SÉCURITÉ: Ne commitez jamais mcp-config.json !" -ForegroundColor Yellow
Write-Host ""

# Proposer d'ouvrir Cursor
$response = Read-Host "Voulez-vous ouvrir Cursor maintenant ? (O/N)"
if ($response -eq 'O' -or $response -eq 'o') {
    Start-Process $cursorPath
}

Write-Host ""
Write-Host "Installation terminée !" -ForegroundColor Green
pause