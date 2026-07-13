@echo off
title Generate Firebase Token
color 0b
echo ===================================================
echo   FIREBASE DEPLOYMENT TOKEN GENERATOR
echo ===================================================
echo.
echo This script will open your web browser to log in to Firebase.
echo After logging in, a long token will be printed in this window.
echo.
pause
echo.
echo Running login:ci...
call npx firebase login:ci
echo.
echo ===================================================
echo Copy the token above (highlight and press Enter).
echo You will paste this into the GITHUB secret: FIREBASE_TOKEN
echo ===================================================
echo.
pause
