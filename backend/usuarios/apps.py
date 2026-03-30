import os
import logging

from django.apps import AppConfig
from django.db.models.signals import post_save, post_delete
from django.contrib.auth import get_user_model

# credenciales genéricas
GENERIC_ADMIN_USERNAME = os.environ.get('GENERIC_ADMIN_USERNAME', 'admin')
GENERIC_ADMIN_PASSWORD = os.environ.get('GENERIC_ADMIN_PASSWORD', '12345678')

# Demo patient credentials - check env vars first, use defaults only if not set
# These must be configured via environment variables in production for security
_env_demo_user = os.environ.get('DEMO_PATIENT_USERNAME')
_env_demo_pass = os.environ.get('DEMO_PATIENT_PASSWORD')

if _env_demo_user is None or _env_demo_pass is None:
    import warnings
    warnings.warn(
        "Demo patient credentials not fully configured. "
        "Set DEMO_PATIENT_USERNAME and DEMO_PATIENT_PASSWORD environment variables. "
        "Using default values for development only.",
        UserWarning
    )
    # Use default values only for development
    DEMO_PATIENT_USERNAME = 'demo_patient'
    DEMO_PATIENT_PASSWORD = 'demo1234'
else:
    DEMO_PATIENT_USERNAME = _env_demo_user
    DEMO_PATIENT_PASSWORD = _env_demo_pass


def ensure_generic_admin():
    """Garantiza que exista un superusuario genérico si no hay otro.

    - Si existen otros superusuarios distintos de "admin", elimina al genérico.
    - Si no hay ningún superusuario, crea "admin" con la contraseña fija.
    """
    User = get_user_model()
    otros = User.objects.filter(is_superuser=True).exclude(username=GENERIC_ADMIN_USERNAME)
    if otros.exists():
        # hay otro/s superusuarios, eliminar el genérico si existe
        User.objects.filter(username=GENERIC_ADMIN_USERNAME).delete()
    else:
        # no hay otros superusuarios, asegurarse de que el genérico exista
        admin, created = User.objects.get_or_create(
            username=GENERIC_ADMIN_USERNAME,
            defaults={
                'email': '',
                'is_superuser': True,
                'is_staff': True,
            }
        )
        # cuando se acaba de crear, asignar la contraseña fija
        # (evitamos comprobar la contraseña existente porque `check_password`
        # puede ser muy lento con configuraciones de hashing costosas)
        if created:
            admin.set_password(GENERIC_ADMIN_PASSWORD)
            admin.save()


def ensure_demo_patient():
    """Garantiza que exista un paciente de demo para probar el chat de IA.
    
    Crea un usuario demo y un paciente asociado si no existen.
    Solo se ejecuta si las credenciales de demo están configuradas.
    """
    # Skip if demo credentials are not configured
    if not DEMO_PATIENT_USERNAME or not DEMO_PATIENT_PASSWORD:
        logger = logging.getLogger(__name__)
        logger.debug("Demo patient functionality disabled - credentials not configured")
        return None
    
    from .models import Paciente, Especialidad
    
    User = get_user_model()
    
    # Crear o obtener el usuario demo
    demo_user, created = User.objects.get_or_create(
        username=DEMO_PATIENT_USERNAME,
        defaults={
            'first_name': 'Demo',
            'last_name': 'Patient',
            'email': 'demo@belkis-saude.local',
            'rol': 'patient',
        }
    )
    if created:
        demo_user.set_password(DEMO_PATIENT_PASSWORD)
        demo_user.save()
    
    # Crear o obtener el paciente asociado
    paciente, created = Paciente.objects.get_or_create(
        usuario=demo_user,
        defaults={
            'alergias': 'Ninguna conocida',
            'grupo_sanguineo': 'O+',
            'contacto_emergencia': 'Contacto Demo',
            'telefono_emergencia': '555-DEMO',
        }
    )
    
    return paciente


def on_user_saved(sender, instance, created, **kwargs):
    """Al guardar un usuario, eliminar el admin genérico si se crea otro superuser."""
    if instance.is_superuser and instance.username != GENERIC_ADMIN_USERNAME:
        User = get_user_model()
        User.objects.filter(username=GENERIC_ADMIN_USERNAME).exclude(pk=instance.pk).delete()
    # si no hay superusuarios en absoluto (p.ej. se eliminó el último), recrear
    ensure_generic_admin()


def on_user_deleted(sender, instance, **kwargs):
    # después de borrar un usuario, comprobar si quedan administradores
    ensure_generic_admin()


class UsuariosConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'usuarios'

    def ready(self):
        # conectar señales para vigilar usuarios
        User = get_user_model()
        post_save.connect(on_user_saved, sender=User)
        post_delete.connect(on_user_deleted, sender=User)
        # garantizar admin genérico al arrancar
        try:
            ensure_generic_admin()
        except Exception:
            # durante migraciones iniciales puede fallar
            pass
        # garantizar paciente demo al arrancar
        try:
            ensure_demo_patient()
        except Exception:
            # durante migraciones iniciales puede fallar
            pass
