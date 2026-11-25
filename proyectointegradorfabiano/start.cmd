@echo off
setlocal
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start.ps1" %*
if errorlevel 1 (
  echo.
  echo El arranque fallo. Revisa el mensaje anterior.
  pause
)
endlocal
