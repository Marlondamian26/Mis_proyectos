from django.contrib.auth import get_user_model, authenticate
U = get_user_model()
print('Superusers:', list(U.objects.filter(is_superuser=True).values_list('username', flat=True)))
auth = authenticate(username='admin', password='12345678')
print('Admin auth works:', bool(auth))
if auth:
    print('User:', auth.username, 'Rol:', auth.rol)
