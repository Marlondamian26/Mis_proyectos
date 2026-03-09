import os, django, sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE','core.settings')
# asegúrate de que el módulo "core" (dentro de backend) esté en el path
sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))
django.setup()

from usuarios.views import registro_usuario
from rest_framework.test import APIRequestFactory

factory = APIRequestFactory()
data={'username':'selfreg','password':'test1234','email':'self@test.com'}
request=factory.post('/api/registro/', data, format='json')
response=registro_usuario(request)
print('status', response.status_code, response.data)

from usuarios.models import Usuario, Paciente
u = Usuario.objects.get(username='selfreg')
print('User rol', u.rol)
print('Paciente count', Paciente.objects.filter(usuario__username='selfreg').count())
