import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
sys.path.insert(0, os.getcwd())
django.setup()

from django.contrib.auth import get_user_model, authenticate
User = get_user_model()

print('=== Recreando admin ===')

# Eliminar si existe
User.objects.filter(username='admin').delete()

# Crear usuario sin contraseña primero
admin = User()
admin.username = 'admin'
admin.email = ''
admin.first_name = 'Administrator'
admin.last_name = 'Generic'
admin.rol = 'admin'
admin.is_superuser = True
admin.is_staff = True

# Establecer contraseña ANTES de guardar
admin.set_password('12345678')

# Guardar
admin.save()

print('[OK] Admin guardado')
print('  Username:', admin.username)
print('  Rol:', admin.rol)
print('  Is superuser:', admin.is_superuser)
print('  Is staff:', admin.is_staff)
print('  Password hash:', admin.password[:40])

# Verificar que NO fue borrado por la lógica de ensure_generic_admin
admin_check = User.objects.filter(username='admin').first()
print('')
print('[CHECK] Admin en DB:', bool(admin_check))

# Intentar autenticación directa
print('')
print('=== Prueba de autenticacion ===')
auth_user = authenticate(username='admin', password='12345678')
if auth_user:
    print('[OK] authenticate() exitoso:', auth_user.username)
else:
    print('[FAIL] authenticate() fallo')
    
    # Intentar verificar contraseña directamente
    print('')
    print('Verificando contrasena directamente...')
    if admin.check_password('12345678'):
        print('[OK] check_password() retorna True - contrasena correcta')
    else:
        print('[FAIL] check_password() retorna False - contrasena incorrecta')

# Mostrar todos los superusers
print('')
print('=== Superusers en la BD ===')
for u in User.objects.filter(is_superuser=True):
    print('[USER]', u.username, '(rol:' + u.rol + ', is_su:' + str(u.is_superuser) + ')')

