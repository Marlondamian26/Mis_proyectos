import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
sys.path.insert(0, os.getcwd())
django.setup()

from django.contrib.auth import get_user_model, authenticate
User = get_user_model()

# Eliminar si existe
User.objects.filter(username='admin').delete()
print('Eliminado usuario admin anterior (si existía)')

# Crear nuevo admin con rol correcto
admin = User.objects.create_superuser(
    username='admin',
    email='',
    password='12345678'
)
# Forzar rol admin
admin.rol = 'admin'
admin.is_superuser = True
admin.is_staff = True
admin.save()

print('✅ Admin creado correctamente')
print('Datos:')
print('  Username:', admin.username)
print('  Rol:', admin.rol)
print('  Is superuser:', admin.is_superuser)
print('  Is staff:', admin.is_staff)

# Verificar autenticación
auth = authenticate(username='admin', password='12345678')
print('\n¿Autenticación exitosa?', bool(auth))
if auth:
    print('✅ Usuario autenticado:', auth.username)
else:
    print('❌ Autenticación falló - revisar contraseña')
