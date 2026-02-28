import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
sys.path.insert(0, os.getcwd())
django.setup()

from django.contrib.auth import get_user_model, authenticate
User = get_user_model()

# Obtener admin
admin = User.objects.filter(username='admin').first()
if admin:
    print('Admin existe')
    print('Username:', admin.username)
    print('Is superuser:', admin.is_superuser)
    print('Is staff:', admin.is_staff)
    print('Rol:', admin.rol if hasattr(admin, 'rol') else 'N/A')
    print('Password hash (primeros 20 chars):', admin.password[:20])
    
    # Intentar autenticarse
    auth = authenticate(username='admin', password='12345678')
    if auth:
        print('✅ Autenticación exitosa')
    else:
        print('❌ Autenticación FALLÓ.')
        print('Reconfigurando contraseña...')
        admin.set_password('12345678')
        admin.save()
        print('Contraseña actualizada')
        
        # Reintentar
        auth = authenticate(username='admin', password='12345678')
        print('¿Ahora funciona?', bool(auth))
else:
    print('Admin no existe - esto no debería pasar')
