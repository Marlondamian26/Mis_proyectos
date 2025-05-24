#!/bin/bash

# Configuración
DB_NAME="phase_platform"
BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql"

# Crear directorio de backups si no existe
mkdir -p $BACKUP_DIR

# Realizar backup
pg_dump -U postgres -d $DB_NAME -F c -f $BACKUP_FILE

# Comprimir backup
gzip $BACKUP_FILE

# Mantener solo los últimos 30 días de backups
find $BACKUP_DIR -name "${DB_NAME}_*.sql.gz" -mtime +30 -delete

# Verificar si el backup fue exitoso
if [ $? -eq 0 ]; then
    echo "Backup completado exitosamente: ${BACKUP_FILE}.gz"
else
    echo "Error al realizar el backup"
    exit 1
fi 