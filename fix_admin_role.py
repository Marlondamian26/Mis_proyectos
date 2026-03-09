import os, django, sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE','core.settings')
sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))
django.setup()

from usuarios.models import Usuario

# Corregir el admin genérico
try:
    admin = Usuario.objects.get(username='admin')
    admin.rol = 'admin'
    admin.is_superuser = True
    admin.is_staff = True
    admin.save()
    print(f"Admin '{admin.username}' corregido: rol={admin.rol}, superuser={admin.is_superuser}")
except Usuario.DoesNotExist:
    print("No existe usuario 'admin'")

# Verificar todos los usuarios
for u in Usuario.objects.all():
    print(f"Usuario: {u.username}, rol: {u.rol}, superuser: {u.is_superuser}")