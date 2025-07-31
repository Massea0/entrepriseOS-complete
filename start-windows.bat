@echo off
echo ===================================
echo   ENTERPRISE OS - DEMARRAGE WINDOWS
echo ===================================
echo.

:: Vérifier si node_modules existe
if not exist "node_modules" (
    echo [!] node_modules manquant - Installation des dependances...
    echo.
    call npm install
    echo.
)

:: Définir NODE_ENV
set NODE_ENV=development

:: Afficher l'URL
echo [i] L'application sera disponible sur : http://localhost:5000
echo [i] API disponible sur : http://localhost:5000/api/*
echo.
echo [i] Utilisateurs de test :
echo     - Admin : ddjily60@gmail.com
echo     - Admin avec company : mdiouf@arcadis.tech
echo.
echo [i] Appuyez sur Ctrl+C pour arreter le serveur
echo.

:: Démarrer le serveur
npx tsx --env-file=.env server/index.ts

pause