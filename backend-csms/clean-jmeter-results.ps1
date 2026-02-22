# Script para limpiar resultados de JMeter
param(
    [Parameter(Mandatory=$false)]
    [string]$ResultsPath = "jmeter-results"
)

Write-Host "Limpiando resultados anteriores..."
if (Test-Path $ResultsPath) {
    Remove-Item -Path "$ResultsPath\*" -Recurse -Force
    Write-Host "Resultados limpiados exitosamente."
} else {
    New-Item -ItemType Directory -Path $ResultsPath -Force
    Write-Host "Directorio de resultados creado: $ResultsPath"
} 