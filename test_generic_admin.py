import os
import django

# prepare environment like previous tests
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# ensure python path covers backend
import sys
sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))

django.setup()

from django.contrib.auth import get_user_model, authenticate
User = get_user_model()

# helper function to print users

def dump():
    print('users:', list(User.objects.all().values_list('username', 'is_superuser')))

# start clean: delete belkis_admin
User.objects.filter(username='belkis_admin').delete()
print('deleted belkis_admin')

# delete all except maybe generic
User.objects.exclude(username='admin').delete()
print('after wiping all except generic:')
dump()

print('generic exists', User.objects.filter(username='admin').exists())
print('superusers', list(User.objects.filter(is_superuser=True).values_list('username', flat=True)))

# test authentication
u = authenticate(username='admin', password='12345678')
print('authenticate generic ->', bool(u))

# create another superuser
new = User.objects.create_superuser('newadmin', '', 'pass9999')
print('created new superuser:', new.username)
print('generic present after creation?', User.objects.filter(username='admin').exists())

# delete newsuperuser
new.delete()
print('after deleting newsuperuser:')
dump()
print('generic exists now?', User.objects.filter(username='admin').exists())
print('superusers', list(User.objects.filter(is_superuser=True).values_list('username', flat=True)))
