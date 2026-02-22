# Configuración
$BACKUP_DIR = "C:\backups"
$DB_NAME = "phase_platform"
$DB_USER = "phase_user"
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$BACKUP_FILE = "$BACKUP_DIR\backup_$TIMESTAMP.sql"

# Crear directorio de backups si no existe
if (-not (Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR
}

# Realizar backup usando pg_dump
& 'C:\Program Files\PostgreSQL\16\bin\pg_dump.exe' -U $DB_USER -d $DB_NAME -f $BACKUP_FILE

# Comprimir backup (usando .NET para compresión)
if (Test-Path $BACKUP_FILE) {
    $compressedFile = "$BACKUP_FILE.gz"
    $bytes = [System.IO.File]::ReadAllBytes($BACKUP_FILE)
    $compressedBytes = [System.IO.Compression.GZipStream]::new(
        [System.IO.File]::Create($compressedFile),
        [System.IO.Compression.CompressionLevel]::Optimal
    )
    $compressedBytes.Write($bytes, 0, $bytes.Length)
    $compressedBytes.Close()
    Remove-Item $BACKUP_FILE
}

# Eliminar backups más antiguos de 7 días
Get-ChildItem -Path $BACKUP_DIR -Filter "backup_*.sql.gz" | 
    Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-7) } | 
    Remove-Item

# Registrar en log
$logMessage = "$(Get-Date): Backup completado - $BACKUP_FILE.gz"
Add-Content -Path "$BACKUP_DIR\backup.log" -Value $logMessage 