import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE','core.settings')
django.setup()
from usuarios.models import Usuario

# create superuser test
user, created = Usuario.objects.get_or_create(username='admin_test')
if created:
    user.set_password('testpass123')
    user.is_superuser = True
    user.is_staff = True
    user.rol = 'admin'
    user.save()
    print('Superuser admin_test creado con contraseña testpass123')
else:
    print('admin_test ya existe')

print('Superusers en la base:', list(Usuario.objects.filter(is_superuser=True).values_list('username', flat=True)))
