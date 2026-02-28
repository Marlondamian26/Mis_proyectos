import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
sys.path.insert(0, os.getcwd())
django.setup()

from django.contrib.auth import get_user_model, authenticate
User = get_user_model()

# Verificar si existe admin
admin = User.objects.filter(username='admin').first()
print('==== Estado del usuario admin ====')
print('¿Existe?', bool(admin))

if admin:
    print('Username:', admin.username)
    print('Is superuser:', admin.is_superuser)
    print('Is staff:', admin.is_staff)
    print('Rol:', admin.rol if hasattr(admin, 'rol') else 'N/A')
    
    # Intentar autenticarse
    auth = authenticate(username='admin', password='12345678')
    print('¿Autenticación exitosa?', bool(auth))
else:
    print('El usuario admin NO existe. Creándolo...')
    admin = User.objects.create_superuser(
        username='admin',
        email='',
        password='12345678'
    )
    admin.rol = 'admin'
    admin.save()
    print('✅ Admin creado exitosamente')
    
    # Verificar
    auth = authenticate(username='admin', password='12345678')
    print('¿Autenticación exitosa ahora?', bool(auth))
