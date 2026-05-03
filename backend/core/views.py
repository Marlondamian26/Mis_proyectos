from django.http import HttpResponse
from django.core.management import call_command
from io import StringIO
from django.contrib.auth.decorators import user_passes_test
from django.views.decorators.http import require_GET

def is_superuser(user):
    return user.is_superuser

@require_GET
@user_passes_test(is_superuser)
def backup_database(request):
    """
    Vista para hacer backup de la base de datos.
    Solo accesible para superusuarios.
    Devuelve el SQL del backup como archivo descargable.
    """
    try:
        # Crear un buffer para capturar la salida
        buffer = StringIO()
        
        # Ejecutar el comando dbbackup
        call_command('dbbackup', stdout=buffer)
        
        # Obtener el contenido
        sql_content = buffer.getvalue()
        
        # Crear respuesta HTTP con el SQL
        response = HttpResponse(sql_content, content_type='application/sql')
        response['Content-Disposition'] = 'attachment; filename="backup.sql"'
        
        return response
    
    except Exception as e:
        return HttpResponse(f"Error al crear backup: {str(e)}", status=500)