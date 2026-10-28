@echo off
title Uninstalling Watch Recorder...
setlocal

set "APP_DIR=%LOCALAPPDATA%\Programs\CreationCue\WatchRecorder"

echo.
echo ========================================================
echo    Uninstalling Creation Cue Watch Recorder...
echo ========================================================
echo.

taskkill /f /im WatchRecorder.exe 2>nul

echo Removing shortcuts...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Remove-Item -Force ([Environment]::GetFolderPath('Programs') + '\WatchRecorder.lnk') -ErrorAction SilentlyContinue; Remove-Item -Force ([Environment]::GetFolderPath('Desktop') + '\WatchRecorder.lnk') -ErrorAction SilentlyContinue"

echo Removing application files...
if exist "%APP_DIR%" rd /s /q "%APP_DIR%" 2>nul

echo.
echo Watch Recorder has been completely removed from your system.
echo.
pause
