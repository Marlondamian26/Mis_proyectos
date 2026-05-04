#!/usr/bin/env python
"""
Script para importar datos de Django dumpdata (JSON) a Supabase PostgreSQL.
Uso: python import_backup.py backup.json
"""

import json
import sys
import psycopg2
from psycopg2.extras import Json

def import_data(json_file, db_url):
    # Conectar a Supabase
    conn = psycopg2.connect(db_url)
    cursor = conn.cursor()
    
    # Leer el archivo JSON
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Procesar cada modelo
    for item in data:
        model = item['model']
        app, model_name = model.split('.')
        
        # Crear tabla si no existe (simplificado)
        table_name = f"{app}_{model_name}"
        
        # Obtener campos
        fields = item['fields']
        
        # Insertar datos
        columns = ', '.join(fields.keys())
        values = ', '.join(['%s'] * len(fields))
        query = f"INSERT INTO {table_name} ({columns}) VALUES ({values})"
        
        cursor.execute(query, list(fields.values()))
    
    conn.commit()
    cursor.close()
    conn.close()
    print("Importación completada")

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Uso: python import_backup.py <archivo.json>")
        sys.exit(1)
    
    json_file = sys.argv[1]
    db_url = "postgresql://postgres:Gestion-Saude@db.qzqghurkbjcirjgoosow.supabase.co:5432/postgres"
    
    import_data(json_file, db_url)