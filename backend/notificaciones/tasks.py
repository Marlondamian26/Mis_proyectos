from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from citas.models import Cita
from .services import ServicioNotificaciones

@shared_task
def enviar_recordatorios_citas():
    """Tarea programada para enviar recordatorios 24h antes"""
    manana = timezone.now().date() + timedelta(days=1)
    
    citas_manana = Cita.objects.filter(
        fecha=manana,
        estado__in=['pendiente', 'confirmada']
    )
    
    for cita in citas_manana:
        ServicioNotificaciones.notificar_recordatorio_cita(cita)
    
    return f"Recordatorios enviados para {citas_manana.count()} citas"

@shared_task
def procesar_respuestas_confirmacion():
    """Procesar respuestas de pacientes a recordatorios"""
    # Esta tarea procesaría las respuestas de WhatsApp/email
    pass