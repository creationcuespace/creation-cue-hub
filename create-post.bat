@echo off
title CreationCue Blog Admin Dashboard
color 0e
echo ===================================================
echo   CREATION CUE - BLOG ADMIN DASHBOARD
echo ===================================================
echo.
echo Launching local server and opening admin dashboard in browser...
node scripts\blog-admin-server.js
if %errorlevel% neq 0 (
    echo.
    color 0c
    echo [ERROR] Admin server failed to start. Make sure Node.js is installed.
    echo.
    pause
)
