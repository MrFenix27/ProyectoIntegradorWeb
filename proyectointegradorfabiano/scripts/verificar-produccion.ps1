<#
.SYNOPSIS
    Verifica el despliegue en la nube (Render + Vercel + Supabase).

.DESCRIPTION
    Despierta el backend de Render si esta dormido (plan Free) y comprueba:
    health check, login, lectura de datos, SPA de Vercel y CORS.

    Ideal para ejecutar 5 minutos antes de la exposicion.

.EXAMPLE
    .\scripts\verificar-produccion.ps1
    .\scripts\verificar-produccion.ps1 -Api https://otro.onrender.com -Web https://otra.vercel.app
#>
param(
    [string]$Api = 'https://coldtrace-api-k6sn.onrender.com',
    [string]$Web = 'https://coldtrace-one.vercel.app',
    [string]$Usuario = 'admin',
    [string]$Password = 'admin123'
)

$ErrorActionPreference = 'Continue'
$fallos = 0

function Linea($estado, $texto, $detalle) {
    $color = if ($estado) { 'Green' } else { 'Red' }
    $marca = if ($estado) { '[ OK ]' } else { '[FAIL]' }
    Write-Host ("{0} {1,-38} {2}" -f $marca, $texto, $detalle) -ForegroundColor $color
}

function Get-Status($scriptblock) {
    try { return & $scriptblock } catch { return $null }
}

Write-Host ''
Write-Host 'ColdTrace - verificacion de produccion' -ForegroundColor Cyan
Write-Host ("  API : {0}" -f $Api)
Write-Host ("  WEB : {0}" -f $Web)
Write-Host ''

# 1. Health (con espera por cold start)
Write-Host '  Despertando backend (Render Free puede tardar ~60 s)...' -ForegroundColor DarkGray
$health = $null
for ($i = 0; $i -lt 40; $i++) {
    try {
        $r = Invoke-WebRequest -Uri "$Api/actuator/health" -UseBasicParsing -TimeoutSec 10
        if ($r.StatusCode -eq 200) { $health = $r; break }
    } catch { }
    Start-Sleep -Seconds 5
    Write-Host '.' -NoNewline
}
Write-Host ''
if ($health) {
    $txt = if ($health.Content -is [byte[]]) { [Text.Encoding]::UTF8.GetString($health.Content) } else { $health.Content }
    Linea $true 'Health check /actuator/health' ($txt.Trim())
} else {
    Linea $false 'Health check /actuator/health' 'sin respuesta'
    $fallos++
}

# 2. Login
$token = $null
try {
    $body = @{ username = $Usuario; password = $Password } | ConvertTo-Json -Compress
    $login = Invoke-WebRequest -Uri "$Api/api/auth/login" -Method POST -Body $body `
                               -ContentType 'application/json' -Headers @{ Origin = $Web } -UseBasicParsing -TimeoutSec 30
    $token = ($login.Content | ConvertFrom-Json).token
    $acao = $login.Headers['Access-Control-Allow-Origin']
    Linea $true "Login ($Usuario)" ("HTTP {0} | CORS: {1}" -f $login.StatusCode, $acao)
} catch {
    Linea $false "Login ($Usuario)" $_.Exception.Message
    $fallos++
}

# 3. Datos
if ($token) {
    try {
        $p = Invoke-WebRequest -Uri "$Api/api/productos" -Headers @{ Authorization = "Bearer $token" } -UseBasicParsing -TimeoutSec 30
        $items = $p.Content | ConvertFrom-Json
        Linea $true 'GET /api/productos' ("{0} productos" -f $items.Count)
    } catch {
        Linea $false 'GET /api/productos' $_.Exception.Message
        $fallos++
    }
}

# 4. SPA en Vercel
foreach ($ruta in @('/', '/lotes')) {
    try {
        $w = Invoke-WebRequest -Uri ("{0}{1}" -f $Web, $ruta) -UseBasicParsing -TimeoutSec 30
        $ok = ($w.StatusCode -eq 200) -and ($w.Content -match '<app-root')
        Linea $ok ("SPA {0}" -f $ruta) ("HTTP {0}" -f $w.StatusCode)
        if (-not $ok) { $fallos++ }
    } catch {
        Linea $false ("SPA {0}" -f $ruta) $_.Exception.Message
        $fallos++
    }
}

# 5. CORS preflight real
try {
    $o = Invoke-WebRequest -Uri "$Api/api/productos" -Method OPTIONS `
        -Headers @{ Origin = $Web; 'Access-Control-Request-Method' = 'GET' } -UseBasicParsing -TimeoutSec 30
    $acao = $o.Headers['Access-Control-Allow-Origin']
    $ok = ($o.StatusCode -eq 200) -and ($acao -eq $Web)
    Linea $ok 'CORS preflight desde Vercel' ("allow-origin: {0}" -f $acao)
    if (-not $ok) { $fallos++ }
} catch {
    Linea $false 'CORS preflight desde Vercel' 'bloqueado o sin cabecera'
    $fallos++
}

Write-Host ''
if ($fallos -eq 0) {
    Write-Host '  Todo listo para la demo.' -ForegroundColor Green
    exit 0
} else {
    Write-Host ("  {0} comprobacion(es) fallaron." -f $fallos) -ForegroundColor Red
    exit 1
}
