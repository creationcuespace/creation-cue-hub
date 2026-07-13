@echo off
title CreationCue Blog Post Creator Wizard
color 0e
echo ===================================================
echo   CREATION CUE - BLOG POST CREATOR WIZARD
echo ===================================================
echo.
node scripts\blog-create.js
if %errorlevel% neq 0 (
    echo.
    color 0c
    echo [ERROR] Publishing wizard encountered an issue. Check errors above.
    echo.
)
pause
