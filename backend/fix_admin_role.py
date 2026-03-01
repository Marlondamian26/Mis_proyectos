from django.contrib.auth import get_user_model
U = get_user_model()
admin = U.objects.filter(username='admin').first()
print('Admin user found:', admin is not None)
if admin:
    print('Current rol:', admin.rol)
    print('Is superuser:', admin.is_superuser)
    print('Is staff:', admin.is_staff)
    
    # Corregir rol
    if admin.rol != 'admin':
        print('Corrigiendo rol a admin...')
        admin.rol = 'admin'
        admin.is_superuser = True
        admin.is_staff = True
        admin.save()
        print('Rol actualizado a admin')
    else:
        print('Rol ya es admin')
