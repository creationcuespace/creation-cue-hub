@echo off
title CreationCue Watch Face Dashboard Updater
color 0e
echo ===================================================
echo   CREATION CUE WATCH FACE DASHBOARD UPDATER
echo ===================================================
echo.
echo 1. Fetching latest Play Store versions...
node fetch-play-versions.js
if %errorlevel% neq 0 (
    echo.
    color 0c
    echo [ERROR] Fetching version codes failed! Check error details above.
    echo.
    pause
    exit /b %errorlevel%
)
echo.
echo 2. Deploying updated files to Firebase Hosting...
call npx firebase deploy --only hosting
if %errorlevel% neq 0 (
    echo.
    color 0c
    echo [ERROR] Firebase deployment failed!
    echo.
    pause
    exit /b %errorlevel%
)
echo.
color 0a
echo ===================================================
echo   SUCCESS! Dashboard has been updated and deployed.
echo ===================================================
echo.
pause
