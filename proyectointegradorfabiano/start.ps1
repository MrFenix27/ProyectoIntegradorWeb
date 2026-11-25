<#
.SYNOPSIS
    Arranca ColdTrace completo en local: base de datos, backend y frontend.

.DESCRIPTION
    - h2    : backend con H2 en memoria (no requiere Docker). Por defecto.
    - mysql : levanta MySQL con docker compose y arranca el backend con el perfil mysql.

.EXAMPLE
    .\start.ps1
    .\start.ps1 -Db mysql
    .\start.ps1 -Db mysql -NoBrowser
    .\start.ps1 -NoFrontend

.NOTES
    Los procesos se abren en ventanas separadas y sus PIDs se guardan en .run\.
    Para detener todo: .\stop.ps1
#>
param(
    [ValidateSet('h2', 'mysql')]
    [string]$Db = 'h2',

    [switch]$NoBackend,
    [switch]$NoFrontend,
    [switch]$NoBrowser
)

$ErrorActionPreference = 'Stop'
$root   = $PSScriptRoot
$runDir = Join-Path $root '.run'
$backendUrl  = 'http://localhost:8080'
$frontendUrl = 'http://localhost:4200'

New-Item -ItemType Directory -Force -Path $runDir | Out-Null
$fallos = 0

function Write-Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Write-Ok($msg)   { Write-Host "    OK   $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "    !!   $msg" -ForegroundColor Yellow }

function Test-Url($url) {
    try {
        $null = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 3
        return $true
    } catch {
        return $false
    }
}

function Wait-Url($url, $seconds, $label) {
    Write-Host ("    esperando {0} " -f $label) -NoNewline
    for ($i = 0; $i -lt $seconds; $i += 3) {
        if (Test-Url $url) {
            Write-Host (" listo ({0} s)" -f $i) -ForegroundColor Green
            return $true
        }
        Start-Sleep -Seconds 3
        Write-Host '.' -NoNewline
    }
    Write-Host ' TIMEOUT' -ForegroundColor Red
    return $false
}

function Start-Terminal($name, $workdir, $command) {
    $launcher = Join-Path $runDir "$name.launch.ps1"
    $content = @(
        "`$host.UI.RawUI.WindowTitle = 'ColdTrace-$name'"
        "Set-Location -LiteralPath '$workdir'"
        "Write-Host '--- ColdTrace $name ---' -ForegroundColor Cyan"
        $command
    ) -join "`r`n"
    Set-Content -Path $launcher -Value $content -Encoding ascii
    $p = Start-Process -FilePath 'powershell.exe' `
         -WorkingDirectory $workdir `
         -ArgumentList @('-NoExit', '-ExecutionPolicy', 'Bypass', '-File', ('"' + $launcher + '"')) `
         -PassThru
    Set-Content -Path (Join-Path $runDir "$name.pid") -Value $p.Id -Encoding ascii
    return $p
}

Write-Host '==========================================' -ForegroundColor DarkCyan
Write-Host '  ColdTrace - arranque local' -ForegroundColor White
Write-Host '==========================================' -ForegroundColor DarkCyan
Write-Host ("  Base de datos : {0}" -f $Db)
Write-Host ("  Backend       : {0}" -f $(if ($NoBackend) { 'omitido' } else { $backendUrl }))
Write-Host ("  Frontend      : {0}" -f $(if ($NoFrontend) { 'omitido' } else { $frontendUrl }))

# ---------------------------------------------------------------- 1. requisitos
Write-Step 'Comprobando requisitos'
if (-not (Get-Command java -ErrorAction SilentlyContinue)) {
    throw 'Java no esta instalado o no esta en el PATH (se requiere JDK 21).'
}
$javaVersion = (& cmd /c 'java -version 2>&1' | Select-Object -First 1)
Write-Ok 'Java detectado'
Write-Host ("    java : {0}" -f $javaVersion)

if (-not $NoFrontend) {
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        throw 'Node.js no esta instalado o no esta en el PATH (se requiere Node 22+).'
    }
    Write-Ok 'Node detectado'
    Write-Host ("    node : {0}" -f (& node -v))
}

# ---------------------------------------------------------------- 2. base de datos
if (-not $NoBackend -and $Db -eq 'mysql') {
    Write-Step 'Levantando MySQL con docker compose'
    $dockerOk = $false
    if (Get-Command docker -ErrorAction SilentlyContinue) {
        & cmd /c 'docker info >nul 2>&1'
        $dockerOk = ($LASTEXITCODE -eq 0)
    }
    if (-not $dockerOk) {
        Write-Warn 'Docker no esta corriendo. Se usara H2 en memoria para esta sesion.'
        $Db = 'h2'
    } else {
        & cmd /c 'docker compose up -d'
        if ($LASTEXITCODE -ne 0) { throw 'docker compose up -d fallo.' }
        Write-Host '    esperando MySQL ' -NoNewline
        $healthy = $false
        for ($i = 0; $i -lt 90; $i += 3) {
            $state = (& cmd /c 'docker inspect --format {{.State.Health.Status}} coldtrace-mysql 2>nul')
            if ($state -eq 'healthy') { $healthy = $true; break }
            Start-Sleep -Seconds 3
            Write-Host '.' -NoNewline
        }
        if ($healthy) { Write-Host ' healthy' -ForegroundColor Green }
        else { Write-Warn 'MySQL no reporto healthy; el backend puede tardar mas en conectar.' }
    }
}

# ---------------------------------------------------------------- 3. backend
if (-not $NoBackend) {
    Write-Step 'Arrancando backend (Spring Boot)'
    if (Test-Url "$backendUrl/actuator/health") {
        Write-Ok "Ya hay un backend respondiendo en $backendUrl (se reutiliza)"
    } else {
        $mvnArgs = 'spring-boot:run'
        $envLine = "`$env:SPRING_PROFILES_ACTIVE = '$Db'"
        $p = Start-Terminal 'backend' $root ("$envLine; .\mvnw.cmd $mvnArgs")
        Write-Ok ("Ventana 'ColdTrace-backend' abierta (PID {0})" -f $p.Id)
        if (-not (Wait-Url "$backendUrl/actuator/health" 300 'backend')) {
            Write-Warn 'El backend no respondio a tiempo. Revisa la ventana ColdTrace-backend.'
            $fallos++
        }
    }
}

# ---------------------------------------------------------------- 4. frontend
if (-not $NoFrontend) {
    $feDir = Join-Path $root 'frontend'
    Write-Step 'Arrancando frontend (Angular)'
    if (-not (Test-Path (Join-Path $feDir 'node_modules'))) {
        Write-Warn 'node_modules no existe: instalando dependencias (puede tardar unos minutos)...'
        Push-Location $feDir
        try { & npm install; if ($LASTEXITCODE -ne 0) { throw 'npm install fallo.' } }
        finally { Pop-Location }
        Write-Ok 'Dependencias instaladas'
    }
    if (Test-Url $frontendUrl) {
        Write-Ok "Ya hay un frontend respondiendo en $frontendUrl (se reutiliza)"
    } else {
        $p = Start-Terminal 'frontend' $feDir 'npm start'
        Write-Ok ("Ventana 'ColdTrace-frontend' abierta (PID {0})" -f $p.Id)
        if (-not (Wait-Url $frontendUrl 180 'frontend')) {
            Write-Warn 'El frontend no respondio a tiempo. Revisa la ventana ColdTrace-frontend.'
            $fallos++
        }
    }
}

# ---------------------------------------------------------------- 5. resumen
Write-Host "`n==========================================" -ForegroundColor DarkCyan
Write-Host '  Listo' -ForegroundColor Green
Write-Host '==========================================' -ForegroundColor DarkCyan
Write-Host ("  Frontend : {0}" -f $frontendUrl)
Write-Host ("  Backend  : {0}" -f $backendUrl)
Write-Host ("  Health   : {0}/actuator/health" -f $backendUrl)
Write-Host '  Usuarios : admin/admin123  user/user123  guest/guest123'
Write-Host '  Detener  : .\stop.ps1'
Write-Host '  Produccion: .\scripts\verificar-produccion.ps1'

if ($fallos -gt 0) { Write-Warn ("{0} componente(s) no arrancaron correctamente." -f $fallos) }

if (-not $NoBrowser -and -not $NoFrontend) {
    try { Start-Process $frontendUrl | Out-Null } catch { }
}

exit $fallos
