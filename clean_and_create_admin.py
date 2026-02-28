import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
sys.path.insert(0, os.getcwd())
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

# Eliminar todos los superusers
User.objects.filter(is_superuser=True).delete()
print('Deleted all superusers')

# Crear solo el admin
admin = User()
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
print('Superusers now:', list(User.objects.filter(is_superuser=True).values_list('username', flat=True)))
