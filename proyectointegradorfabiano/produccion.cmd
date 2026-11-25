@echo off
REM Equivalente en la nube de start.cmd: despierta Render, comprueba Supabase
REM y abre el frontend de Vercel. No arranca nada local.
setlocal
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\verificar-produccion.ps1" %*
echo.
pause
endlocal
