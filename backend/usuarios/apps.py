from django.apps import AppConfig
from django.db.models.signals import post_save, post_delete
from django.contrib.auth import get_user_model


# credenciales genéricas
GENERIC_ADMIN_USERNAME = "admin"
GENERIC_ADMIN_PASSWORD = "12345678"


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
