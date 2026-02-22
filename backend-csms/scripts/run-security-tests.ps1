# Script para ejecutar pruebas de seguridad con OWASP ZAP
param(
    [Parameter(Mandatory=$true)]
    [string]$targetUrl,
    
    [Parameter(Mandatory=$false)]
    [string]$zapPath = "C:\Program Files\ZAP\Zed Attack Proxy",
    
    [Parameter(Mandatory=$false)]
    [string]$reportPath = ".\reports\security-report.html",
    
    [Parameter(Mandatory=$false)]
    [int]$port = 3000,
    
    [Parameter(Mandatory=$false)]
    [switch]$showVerbose
)

# Función para escribir mensajes con timestamp
function Write-Log {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch ($Level) {
        "ERROR" { "Red" }
        "WARN" { "Yellow" }
        "SUCCESS" { "Green" }
        default { "White" }
    }
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
}

# Función para verificar si un proceso está corriendo
function Test-ProcessRunning {
    param(
        [string]$ProcessName
    )
    return Get-Process $ProcessName -ErrorAction SilentlyContinue
}

# Función para verificar si un puerto está en uso
function Test-PortInUse {
    param(
        [int]$Port
    )
    $listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Any, $Port)
    try {
        $listener.Start()
        $listener.Stop()
        return $false
    }
    catch {
        return $true
    }
}

# Función para verificar si una URL está accesible
function Test-UrlAccessible {
    param(
        [string]$Url
    )
    try {
        $response = Invoke-WebRequest -Uri $Url -Method Head -TimeoutSec 5
        return $response.StatusCode -eq 200
    }
    catch {
        return $false
    }
}

# Función para crear directorio si no existe
function Ensure-DirectoryExists {
    param(
        [string]$Path
    )
    if (-not (Test-Path $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
        Write-Log "Directorio creado: $Path" "INFO"
    }
}

# Verificar permisos de administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Log "Este script requiere permisos de administrador." "ERROR"
    Write-Log "Para ejecutar PowerShell como administrador:" "ERROR"
    Write-Log "1. Cierra esta ventana de PowerShell" "ERROR"
    Write-Log "2. Haz clic derecho en el ícono de PowerShell" "ERROR"
    Write-Log "3. Selecciona 'Ejecutar como administrador'" "ERROR"
    Write-Log "4. Navega a tu directorio: cd '$PWD'" "ERROR"
    Write-Log "5. Ejecuta el script nuevamente" "ERROR"
    exit 1
}

Write-Log "Iniciando pruebas de seguridad con OWASP ZAP..." "INFO"
Write-Log "URL objetivo: $targetUrl" "INFO"

# Verificar Java
try {
    $javaVersion = java -version 2>&1
    Write-Log "Java encontrado: $javaVersion" "SUCCESS"
}
catch {
    Write-Log "Java no encontrado. Por favor, instala Java y asegúrate de que esté en el PATH." "ERROR"
    exit 1
}

# Verificar ZAP
$zapBatPath = Join-Path $zapPath "zap.bat"
if (-not (Test-Path $zapBatPath)) {
    Write-Log "OWASP ZAP no encontrado en: $zapPath" "ERROR"
    Write-Log "Por favor, instala OWASP ZAP en la ubicación correcta." "ERROR"
    exit 1
}
Write-Log "ZAP encontrado en: $zapPath" "SUCCESS"

# Verificar si la aplicación está corriendo
if (-not (Test-UrlAccessible $targetUrl)) {
    Write-Log "No se puede acceder a la aplicación en $targetUrl" "ERROR"
    Write-Log "Asegúrate de que la aplicación esté corriendo en el puerto $port" "ERROR"
    exit 1
}
Write-Log "Aplicación accesible en $targetUrl" "SUCCESS"

# Convertir rutas relativas a absolutas
$currentDir = $PWD.Path
$reportPath = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($currentDir, $reportPath))
$reportDir = Split-Path $reportPath -Parent

# Crear directorio de reportes si no existe
Ensure-DirectoryExists $reportDir

# Verificar instancias existentes de ZAP
Write-Log "Verificando instancias existentes de ZAP..." "INFO"
$zapProcesses = Test-ProcessRunning "java" | Where-Object { $_.CommandLine -like "*zap*" }
if ($zapProcesses) {
    Write-Log "Detectadas instancias existentes de ZAP. Intentando cerrarlas..." "WARN"
    $zapProcesses | ForEach-Object { Stop-Process $_.Id -Force }
    Start-Sleep -Seconds 2
}

# Ejecutar ZAP
Write-Log "Ejecutando ZAP desde: $zapBatPath" "INFO"
Write-Log "Ejecutando comando de ZAP..." "INFO"

try {
    # Cambiar al directorio de ZAP
    Push-Location $zapPath
    
    # Ejecutar ZAP con parámetros
    $zapCommand = ".\zap.bat -cmd -quickurl $targetUrl -quickprogress -quickout `"$reportPath`""
    if ($showVerbose) {
        $zapCommand += " -verbose"
    }
    
    Write-Log "Comando a ejecutar: $zapCommand" "INFO"
    Invoke-Expression $zapCommand
    
    # Verificar si el reporte se generó correctamente
    if (Test-Path $reportPath) {
        Write-Log "Pruebas de seguridad completadas. Reporte generado en: $reportPath" "SUCCESS"
        
        # Leer y mostrar resumen del reporte
        $reportContent = Get-Content $reportPath -Raw
        if ($reportContent -match "Nivel de riesgo.*?Alto.*?(\d+).*?Medio.*?(\d+).*?Bajo.*?(\d+)") {
            Write-Log "Resumen de vulnerabilidades encontradas:" "INFO"
            Write-Log "  - Alto: $($matches[1])" "INFO"
            Write-Log "  - Medio: $($matches[2])" "INFO"
            Write-Log "  - Bajo: $($matches[3])" "INFO"
        }
    }
    else {
        Write-Log "Error: No se pudo generar el reporte de seguridad" "ERROR"
    }
}
catch {
    Write-Log "Error al ejecutar ZAP: $_" "ERROR"
    exit 1
}
finally {
    # Volver al directorio original
    Pop-Location
}

Write-Log "Proceso de pruebas de seguridad finalizado" "SUCCESS" 