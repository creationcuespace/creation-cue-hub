@echo off
title Installing Watch Recorder...
setlocal

set "APP_DIR=%LOCALAPPDATA%\Programs\CreationCue\WatchRecorder"
set "SCRIPT_DIR=%~dp0"

echo.
echo ========================================================
echo    Installing Creation Cue Watch Recorder...
echo ========================================================
echo.

if not exist "%APP_DIR%" mkdir "%APP_DIR%"

if exist "%~dp0WatchRecorder.exe" (
    echo [1/3] Copying application files...
    copy /y "%~dp0WatchRecorder.exe" "%APP_DIR%\WatchRecorder.exe" >nul
    if exist "%~dp0favicon.ico" copy /y "%~dp0favicon.ico" "%APP_DIR%\favicon.ico" >nul
    if exist "%~dp0Uninstall.bat" copy /y "%~dp0Uninstall.bat" "%APP_DIR%\Uninstall.bat" >nul
) else (
    echo [1/3] Extracting WatchRecorder package from Downloads...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "$appDir = $env:APP_DIR; $searchDirs = @((Join-Path $env:USERPROFILE 'Downloads'), 'D:\DOWNLOADs'); try { $reg = Get-ItemProperty 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders' -ErrorAction SilentlyContinue; if ($reg.'{374DE290-123F-4565-9164-39C4925E467B}') { $searchDirs += [Environment]::ExpandEnvironmentVariables($reg.'{374DE290-123F-4565-9164-39C4925E467B}') } } catch {}; $zip = $searchDirs | Where-Object { Test-Path $_ } | Select-Object -Unique | ForEach-Object { Get-ChildItem -Path $_ -Filter 'WatchRecorder*.zip' -ErrorAction SilentlyContinue } | Sort-Object LastWriteTime -Descending | Select-Object -First 1; if ($zip) { Write-Host ('Found: ' + $zip.FullName); Expand-Archive -Path $zip.FullName -DestinationPath $appDir -Force }"
)

if not exist "%APP_DIR%\WatchRecorder.exe" (
    echo.
    echo [ERROR] Could not find WatchRecorder.exe next to Install.bat or in Downloads.
    echo Please right-click WatchRecorder.zip, choose "Extract All...",
    echo and then run Install.bat from the extracted folder.
    echo.
    pause
    exit /b 1
)

echo [2/3] Creating Start Menu and Desktop shortcuts...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$appDir = $env:APP_DIR; $ws = New-Object -ComObject WScript.Shell; $target = Join-Path $appDir 'WatchRecorder.exe'; $ico = Join-Path $appDir 'favicon.ico'; $icoLoc = if (Test-Path $ico) { $ico + ',0' } else { $target + ',0' }; foreach ($folder in @('Programs', 'Desktop')) { $lnk = Join-Path ([Environment]::GetFolderPath($folder)) 'WatchRecorder.lnk'; $s = $ws.CreateShortcut($lnk); $s.TargetPath = $target; $s.WorkingDirectory = $appDir; $s.IconLocation = $icoLoc; $s.Save(); Write-Host ('Created shortcut: ' + $lnk) }"

echo [3/3] Installation complete!
echo.
echo Watch Recorder has been installed to:
echo %APP_DIR%
echo.
echo You can now find "WatchRecorder" on your Desktop or in the Start Menu!
echo.
echo Launching Watch Recorder now...
start "" "%APP_DIR%\WatchRecorder.exe"
ping 127.0.0.1 -n 2 >nul
exit
