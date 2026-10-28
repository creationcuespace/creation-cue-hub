@echo off
title Installing Watch Recorder...
setlocal

set "APP_DIR=%LOCALAPPDATA%\Programs\CreationCue\WatchRecorder"
echo.
echo ========================================================
echo    Installing Creation Cue Watch Recorder...
echo ========================================================
echo.

if not exist "%APP_DIR%" mkdir "%APP_DIR%"

echo [1/3] Copying application files...
copy /y "%~dp0WatchRecorder.exe" "%APP_DIR%\WatchRecorder.exe" >nul
if exist "%~dp0favicon.ico" copy /y "%~dp0favicon.ico" "%APP_DIR%\favicon.ico" >nul

echo [2/3] Creating Start Menu and Desktop shortcuts...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ws = New-Object -ComObject WScript.Shell; $target = '%APP_DIR%\WatchRecorder.exe'; $ico = '%APP_DIR%\favicon.ico'; $prog = [Environment]::GetFolderPath('Programs') + '\WatchRecorder.lnk'; $s = $ws.CreateShortcut($prog); $s.TargetPath = $target; $s.WorkingDirectory = '%APP_DIR%'; if (Test-Path $ico) { $s.IconLocation = $ico + ',0' } else { $s.IconLocation = $target + ',0' }; $s.Save(); $desk = [Environment]::GetFolderPath('Desktop') + '\WatchRecorder.lnk'; $d = $ws.CreateShortcut($desk); $d.TargetPath = $target; $d.WorkingDirectory = '%APP_DIR%'; if (Test-Path $ico) { $d.IconLocation = $ico + ',0' } else { $d.IconLocation = $target + ',0' }; $d.Save()"

echo [3/3] Installation complete!
echo.
echo Watch Recorder has been installed to:
echo %APP_DIR%
echo.
echo You can now search "WatchRecorder" in your Start Menu anytime!
echo.
echo Launching Watch Recorder now...
start "" "%APP_DIR%\WatchRecorder.exe"
ping 127.0.0.1 -n 2 >nul
exit
