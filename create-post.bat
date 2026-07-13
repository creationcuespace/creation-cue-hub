@echo off
title CreationCue Blog Admin Dashboard
color 0e
echo ===================================================
echo   CREATION CUE - BLOG ADMIN DASHBOARD
echo ===================================================
echo.

:: Check if server is already running on port 3000
netstat -an 2>nul | find "3000" | find "LISTENING" >nul 2>&1
if %errorlevel% == 0 (
    echo Server already running^^! Opening browser tab...
    start http://localhost:3000
    timeout /t 2 >nul
    exit
)

echo Launching local server and opening admin dashboard...
node scripts\blog-admin-server.js
if %errorlevel% neq 0 (
    echo.
    color 0c
    echo [ERROR] Admin server failed to start. Make sure Node.js is installed.
    echo.
    pause
)
