import os
import django
import sys
os.environ.setdefault('DJANGO_SETTINGS_MODULE','core.settings')
sys.path.insert(0, os.getcwd())
django.setup()
from django.contrib.auth import get_user_model, authenticate
U = get_user_model()
admins = list(U.objects.filter(is_superuser=True).values_list('username', flat=True))
print('Superusers:', admins)
auth = authenticate(username='admin', password='12345678')
print('Admin auth works:', bool(auth))
