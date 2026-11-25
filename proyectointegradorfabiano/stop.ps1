<#
.SYNOPSIS
    Detiene el backend y el frontend arrancados por start.ps1.

.EXAMPLE
    .\stop.ps1
    .\stop.ps1 -WithDb
#>
param(
    [switch]$WithDb
)

$root   = $PSScriptRoot
$runDir = Join-Path $root '.run'

function Stop-FromPid($name) {
    $file = Join-Path $runDir "$name.pid"
    if (-not (Test-Path $file)) {
        Write-Host ("  {0}: no hay PID registrado" -f $name) -ForegroundColor DarkGray
        return
    }
    $pidValue = (Get-Content $file | Select-Object -First 1).Trim()
    if ($pidValue -match '^\d+$') {
        & taskkill /PID $pidValue /T /F 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host ("  {0}: detenido (PID {1})" -f $name, $pidValue) -ForegroundColor Green
        } else {
            Write-Host ("  {0}: el proceso {1} ya no existia" -f $name, $pidValue) -ForegroundColor DarkGray
        }
    }
    Remove-Item $file -Force -ErrorAction SilentlyContinue
}

Write-Host 'Deteniendo ColdTrace...' -ForegroundColor Cyan
Stop-FromPid 'backend'
Stop-FromPid 'frontend'
Get-ChildItem (Join-Path $runDir '*.launch.ps1') -ErrorAction SilentlyContinue | Remove-Item -Force

if ($WithDb) {
    Write-Host '  mysql: deteniendo contenedor...' -NoNewline
    & docker compose -f (Join-Path $root 'docker-compose.yml') stop 2>&1 | Out-Null
    Write-Host ' listo' -ForegroundColor Green
}

Write-Host 'Listo.' -ForegroundColor Cyan
