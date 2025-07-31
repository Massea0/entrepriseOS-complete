@echo off
echo ========================================
echo   DEMARRAGE RAPIDE - Enterprise OS
echo ========================================
echo.

REM Set environment variable
set NODE_ENV=development

REM Check if .env exists
if not exist .env (
    echo [!] Fichier .env manquant!
    echo Creation depuis .env.example...
    copy .env.example .env
    echo.
    echo [!] IMPORTANT: Modifiez .env avec vos cles Supabase!
    echo.
    pause
)

echo [*] Demarrage du serveur...
echo [*] URL: http://localhost:5173
echo.
echo [!] Ignorant les erreurs TypeScript pour un demarrage rapide
echo.

REM Start with transpile-only to ignore TypeScript errors
npx tsx --transpile-only --env-file=.env server/index.ts