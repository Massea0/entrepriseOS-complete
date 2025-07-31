@echo off
echo =====================================
echo   Installation MCP Supabase - Windows
echo =====================================
echo.

REM Verifier si mcp-config.json existe
if not exist mcp-config.json (
    echo [ERREUR] mcp-config.json n'existe pas dans ce dossier
    echo Assurez-vous d'etre dans le dossier du projet
    pause
    exit /b 1
)

REM Creer le dossier de config Cursor
echo [INFO] Creation du dossier de configuration...
if not exist "%APPDATA%\Cursor\User" mkdir "%APPDATA%\Cursor\User"

REM Copier la configuration
echo [INFO] Copie de la configuration MCP...
copy /Y mcp-config.json "%APPDATA%\Cursor\User\mcp.json" >nul

if %ERRORLEVEL% EQU 0 (
    echo [OK] Configuration copiee avec succes!
) else (
    echo [ERREUR] Impossible de copier la configuration
    pause
    exit /b 1
)

echo.
echo ====================================
echo      Installation terminee !       
echo ====================================
echo.
echo Prochaines etapes:
echo 1. Fermez completement Cursor
echo 2. Redemarrez Cursor
echo 3. Vous devriez voir "MCP Connected: supabase"
echo.
echo SECURITE: Ne commitez jamais mcp-config.json !
echo.
pause