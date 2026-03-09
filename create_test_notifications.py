#!/usr/bin/env python
"""
Script para crear notificaciones de prueba
"""
import os
import sys
import django

# Configurar Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from usuarios.models import Usuario
from notificaciones.models import Notificacion

def crear_notificaciones_prueba():
    """Crea notificaciones de prueba para todos los usuarios"""

    usuarios = Usuario.objects.all()
    if not usuarios.exists():
        print("No hay usuarios en la base de datos")
        return

    tipos_notificaciones = [
        ('recordatorio_cita', 'Recordatorio de Cita', 'Tienes una cita programada para mañana a las 10:00 AM'),
        ('confirmacion_cita', 'Cita Confirmada', 'Tu cita ha sido confirmada exitosamente'),
        ('nueva_cita', 'Nueva Cita', 'Se ha agendado una nueva cita médica'),
        ('disponibilidad_doctor', 'Doctor Disponible', 'El doctor está disponible para consultas'),
    ]

    notificaciones_creadas = 0

    for usuario in usuarios:
        # Crear 2-3 notificaciones por usuario
        import random
        num_notifs = random.randint(1, 3)

        for i in range(num_notifs):
            tipo, titulo, mensaje = random.choice(tipos_notificaciones)

            # Hacer algunas leídas y otras no
            leida = random.choice([True, False])

            Notificacion.objects.create(
                usuario=usuario,
                tipo=tipo,
                titulo=titulo,
                mensaje=f"{mensaje} - Usuario: {usuario.username}",
                leida=leida
            )
            notificaciones_creadas += 1

    print(f"Se crearon {notificaciones_creadas} notificaciones de prueba")

    # Mostrar resumen
    total = Notificacion.objects.count()
    no_leidas = Notificacion.objects.filter(leida=False).count()
    print(f"Total de notificaciones: {total}")
    print(f"Notificaciones no leídas: {no_leidas}")

if __name__ == '__main__':
    crear_notificaciones_prueba()