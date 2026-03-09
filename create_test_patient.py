import os, django, sys
os.environ.setdefault('DJANGO_SETTINGS_MODULE','core.settings')
sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))
django.setup()
from usuarios.models import Usuario, Paciente

# crear usuario paciente
usuario = Usuario.objects.create_user(
    username='auto_patient',
    password='pass1234',
    rol='patient'
)
print('Created user:', usuario.username, 'rol', usuario.rol)

# verificar perfil paciente
p, created = Paciente.objects.get_or_create(usuario=usuario)
print('Paciente profile:', p.id, 'created?', created)

print('Total pacientes:', Paciente.objects.count())
print('Usuarios con rol patient:', Usuario.objects.filter(rol='patient').count())
