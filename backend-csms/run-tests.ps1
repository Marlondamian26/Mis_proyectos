# Script para ejecutar pruebas de JMeter

# Definir variables
$JMETER_HOME = "C:\Users\Marlon\apache-jmeter-5.6.3\apache-jmeter-5.6.3"
$TEST_PLAN = ".\jmeter\http_request.jmx"
$RESULTS_DIR = ".\results"
$REPORT_DIR = ".\reports"

# Limpiar resultados anteriores
Write-Host "Limpiando resultados anteriores..."
Remove-Item -Path "$RESULTS_DIR\*" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$REPORT_DIR\*" -Recurse -Force -ErrorAction SilentlyContinue

# Crear directorios si no existen
New-Item -ItemType Directory -Force -Path $RESULTS_DIR
New-Item -ItemType Directory -Force -Path $REPORT_DIR

# Ejecutar prueba de JMeter
Write-Host "Ejecutando pruebas de JMeter..."
& "$JMETER_HOME\bin\jmeter.bat" -n -t $TEST_PLAN -l "$RESULTS_DIR\results.jtl" -e -o $REPORT_DIR

Write-Host "Pruebas completadas. Los resultados se encuentran en: $RESULTS_DIR"
Write-Host "El reporte HTML se encuentra en: $REPORT_DIR" 