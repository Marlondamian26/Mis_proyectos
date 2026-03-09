import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))
django.setup()

from usuarios.models import Usuario

# Crear admin
admin = Usuario()
admin.username = 'admin'
admin.email = ''
admin.first_name = 'Administrator'
admin.last_name = 'Generic'
admin.rol = 'admin'
admin.is_superuser = True
admin.is_staff = True
admin.set_password('12345678')
admin.save()

print('Created admin user')