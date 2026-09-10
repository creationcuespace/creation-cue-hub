@echo off
title Creation Cue Watch ADB Bridge
echo Starting Creation Cue Watch ADB Bridge...
echo.
start "" "https://creationcue.web.app/watch-recorder"
python "%~dp0watch_bridge.py"
pause
