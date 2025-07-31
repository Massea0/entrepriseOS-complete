@echo off
echo Starting Enterprise OS Development Server...
echo.

REM Use npx to run cross-env to ensure it's found
npx cross-env NODE_ENV=development tsx --env-file=.env server/index.ts

pause