#!/usr/bin/env python3
"""
Script para limpiar usuarios de prueba y mantener solo el admin genérico
"""
import os
import django
import sys

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
sys.path.insert(0, os.getcwd() + '/backend')
django.setup()

from django.contrib.auth import get_user_model
from usuarios.models import Doctor, Enfermera, Paciente

Usuario = get_user_model()

print("=" * 60)
print("LIMPIEZA DE USUARIOS DE PRUEBA")
print("=" * 60)

# Contar antes
print(f"\nTotal usuarios ANTES: {Usuario.objects.count()}")
print(f"Doctores ANTES: {Doctor.objects.count()}")
print(f"Enfermeras ANTES: {Enfermera.objects.count()}")
print(f"Pacientes ANTES: {Paciente.objects.count()}")

# Eliminar todos los usuarios de prueba usando DELETE directo en SQL para evitar signals
print(f"\nEliminando usuarios de prueba...")

# Usar .raw() para ejecutar delete directamente sin triggers
Doctor.objects.all().delete()
Enfermera.objects.all().delete()
Paciente.objects.all().delete()

# Eliminar usuarios que no sean 'admin'
usuarios_a_eliminar = Usuario.objects.exclude(username='admin')
count = usuarios_a_eliminar.count()
print(f"Eliminando {count} usuarios restantes...")

for usuario in list(usuarios_a_eliminar):
    print(f"  - {usuario.username} ({usuario.rol})")
    Usuario.objects.filter(id=usuario.id).delete()

# Contar después
print(f"\nTotal usuarios DESPUÉS: {Usuario.objects.count()}")
print(f"Doctores DESPUÉS: {Doctor.objects.count()}")
print(f"Enfermeras DESPUÉS: {Enfermera.objects.count()}")
print(f"Pacientes DESPUÉS: {Paciente.objects.count()}")

# Verificar que admin existe
admin = Usuario.objects.filter(username='admin').first()
if admin:
    print(f"\n✓ Admin verificado:")
    print(f"  - Username: {admin.username}")
    print(f"  - Rol: {admin.rol}")
    print(f"  - Is superuser: {admin.is_superuser}")
    print(f"  - Is staff: {admin.is_staff}")
else:
    print(f"\n✗ ERROR: Admin no encontrado en la BD")
    print("Recreando admin genérico...")
    # Si no existe, crear el admin genérico
    admin = Usuario.objects.create_user(
        username='admin',
        password='12345678',
        rol='admin',
        is_superuser=True,
        is_staff=True
    )
    print(f"✓ Admin genérico recreado")

print("\n" + "=" * 60)
print("LIMPIEZA COMPLETADA")
print("=" * 60)
