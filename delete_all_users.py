import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))
django.setup()

from usuarios.models import Usuario

# Eliminar todos los usuarios
deleted_count, _ = Usuario.objects.all().delete()
print(f'Deleted {deleted_count} users')

print('All users have been deleted from the database.')