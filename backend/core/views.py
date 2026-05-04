from django.http import HttpResponse
from django.core.management import call_command
from django.conf import settings
import os

def backup_database(request):
    """
    Vista temporal para hacer backup de la base de datos.
    Devuelve el SQL del backup como archivo descargable.
    """
    try:
        # Ejecutar el comando dbbackup
        call_command('dbbackup')
        
        # Encontrar el archivo generado
        backup_dir = '/tmp/dbbackups'
        files = [f for f in os.listdir(backup_dir) if f.endswith('.sql')]
        if not files:
            return HttpResponse("No backup file found", status=500)
        
        # Tomar el más reciente
        latest_file = max(files, key=lambda f: os.path.getctime(os.path.join(backup_dir, f)))
        file_path = os.path.join(backup_dir, latest_file)
        
        # Leer el contenido
        with open(file_path, 'r') as f:
            sql_content = f.read()
        
        # Limpiar el archivo
        os.remove(file_path)
        
        # Crear respuesta HTTP con el SQL
        response = HttpResponse(sql_content, content_type='application/sql')
        response['Content-Disposition'] = 'attachment; filename="backup.sql"'
        
        return response
        
    except Exception as e:
        return HttpResponse(f"Error: {str(e)}", status=500)
        
        return response
    
    except Exception as e:
        return HttpResponse(f"Error al crear backup: {str(e)}", status=500)