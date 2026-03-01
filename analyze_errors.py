#!/usr/bin/env python3
"""
Script para analizar detalladamente qué está pasando con los errores
"""
import requests
import json
import time

BASE_URL = 'http://localhost:8000'
API_URL = f'{BASE_URL}/api'

print("=" * 70)
print("ANÁLISIS DETALLADO DE LOS 7 ERRORES")
print("=" * 70)

# Primero, obtener token del admin
print("\n[1/7] ANÁLISIS: Error al crear doctor (Status 400)")
print("-" * 70)

response = requests.post(f'{API_URL}/token/', json={
    'username': 'admin',
    'password': '12345678'
})

if response.status_code != 200:
    print("ERROR: No se pudo obtener token del admin")
    exit(1)

admin_token = response.json()['access']
headers = {'Authorization': f'Bearer {admin_token}'}

# Error 1: Crear doctor (status 400)
print("Intentando crear doctor...")
doctor_data = {
    'username': 'doctor_test',
    'password': 'test1234',
    'first_name': 'Juan',
    'last_name': 'Pérez',
    'email': 'doctor@test.com',
    'rol': 'doctor'
}

response = requests.post(f'{API_URL}/usuarios/', json=doctor_data, headers=headers)
print(f"Status: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")

if response.status_code == 400:
    print("CAUSA: El usuario 'doctor_test' ya existe en la BD")
    print("SOLUCIÓN: Usar username único o cambiar el nombre en el test")

# Error 2-4: Crear enfermera/paciente (status 404)
print("\n[2/7] ANÁLISIS: Error al crear enfermera (Status 404)")
print("-" * 70)

# Primero veamos si el usuario enfermera existe
print("Buscando usuario 'nurse_test'...")
response = requests.get(f'{API_URL}/usuarios/', headers=headers, params={'search': 'nurse_test'})
print(f"Status: {response.status_code}")
usuarios = response.json().get('results', [])
print(f"Usuarios encontrados: {len(usuarios)}")
for u in usuarios:
    print(f"  - {u['username']} (rol={u['rol']})")

print("\nIntentando crear usuario enfermera...")
nurse_data = {
    'username': 'nurse_test',
    'password': 'test1234',
    'first_name': 'María',
    'last_name': 'González',
    'email': 'nurse@test.com',
    'rol': 'nurse'
}

response = requests.post(f'{API_URL}/usuarios/', json=nurse_data, headers=headers)
print(f"Status: {response.status_code}")

if response.status_code in [201, 200]:
    print("✓ Usuario enfermera creado exitosamente")
    nurse_user = response.json()
    print(f"  ID: {nurse_user.get('id')}")
    print(f"  Username: {nurse_user.get('username')}")
    print(f"  Rol: {nurse_user.get('rol')}")
    
    # Ahora intentar crear el perfil de enfermera
    print("\nIntentando crear perfil de enfermera en /api/enfermeras/...")
    nurse_profile = {
        'usuario_id': nurse_user['id']
    }
    response = requests.post(f'{API_URL}/enfermeras/', json=nurse_profile, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)[:200]}")
else:
    print(f"✗ Error al crear usuario: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

# Error 5-6: Login de enfermera/paciente (status 401)
print("\n[5/7] ANÁLISIS: Error en login de enfermera (Status 401)")
print("-" * 70)

print("Intentando login como enfermera...")
response = requests.post(f'{API_URL}/token/', json={
    'username': 'nurse_test',
    'password': 'test1234'
})
print(f"Status: {response.status_code}")
if response.status_code == 200:
    print("✓ Login exitoso")
    print(f"  Access token: {response.json()['access'][:40]}...")
else:
    print(f"✗ Error: {response.status_code}")
    error_msg = response.json()
    print(f"Response: {json.dumps(error_msg, indent=2)}")
    if 'detail' in error_msg:
        print(f"CAUSA: {error_msg['detail']}")

# Verificar usuariosexistentes
print("\n[VERIFICACIÓN] Usuarios en la BD:")
print("-" * 70)
response = requests.get(f'{API_URL}/usuarios/', headers=headers)
usuarios = response.json().get('results', [])
print(f"Total usuarios: {len(usuarios)}")
for u in usuarios[:15]:
    print(f"  - {u['username']:20} (rol={u['rol']:8}, is_superuser={u.get('is_superuser')})")

print("\n" + "=" * 70)
print("ANÁLISIS COMPLETADO")
print("=" * 70)
