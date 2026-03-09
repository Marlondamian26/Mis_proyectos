import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))
django.setup()

from usuarios.models import Usuario, Paciente

# Verificar usuarios con rol patient
pacientes_usuarios = Usuario.objects.filter(rol='patient')
print(f"Usuarios con rol 'patient': {pacientes_usuarios.count()}")

for user in pacientes_usuarios:
    try:
        paciente = Paciente.objects.get(usuario=user)
        print(f"Usuario {user.username}: Tiene perfil Paciente (ID: {paciente.id})")
    except Paciente.DoesNotExist:
        print(f"Usuario {user.username}: NO tiene perfil Paciente")

print("\nTotal de perfiles Paciente:", Paciente.objects.count())