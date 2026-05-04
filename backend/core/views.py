from django.http import HttpResponse
from django.core.management import call_command
from io import StringIO

def backup_database(request):
    """
    Vista temporal para hacer backup de la base de datos.
    Devuelve los datos en formato JSON de Django dumpdata.
    """
    try:
        # Crear un buffer para capturar la salida
        buffer = StringIO()
        
        # Ejecutar dumpdata (exporta datos en JSON)
        call_command('dumpdata', stdout=buffer)
        
        # Obtener el contenido
        json_content = buffer.getvalue()
        
        # Crear respuesta HTTP con el JSON
        response = HttpResponse(json_content, content_type='application/json')
        response['Content-Disposition'] = 'attachment; filename="backup.json"'
        
        return response
        
    except Exception as e:
        return HttpResponse(f"Error: {str(e)}", status=500)
        
        return response
    
    except Exception as e:
        return HttpResponse(f"Error al crear backup: {str(e)}", status=500)