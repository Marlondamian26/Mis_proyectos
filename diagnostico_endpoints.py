"""
DIAGNÓSTICO DE ENDPOINTS - BELKIS SAÚDE
Para usar desde el terminal con python manage.py shell
"""

import os
import sys
import django

# Agregar el directorio backend al path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.urls import get_resolver
from django.test import Client
import json

print("\n" + "="*80)
print("DIAGNÓSTICO COMPLETO DE ENDPOINTS")
print("="*80)

# Obtener todos los patrones de URL
resolver = get_resolver()
patterns = resolver.url_patterns

print("\n📍 ENDPOINTS DISPONIBLES:\n")

endpoints = []
for pattern in patterns:
    if hasattr(pattern, 'url_patterns'):  # Es un include()
        for subpattern in pattern.url_patterns:
            route = str(pattern.pattern) + str(subpattern.pattern)
            endpoints.append(route)
            print(f"  {route}")
    else:
        route = str(pattern.pattern)
        endpoints.append(route)
        print(f"  {route}")

# Probar endpoints críticos
print("\n" + "="*80)
print("PRUEBAS DE ENDPOINTS CRÍTICOS")
print("="*80)

client = Client()

# Test 1: Token Obtain
print("\n🔐 TEST 1: Obtener Token (POST /api/token/)")
print("-" * 60)
response = client.post('/api/token/', {
    'username': 'admin',
    'password': 'admin12345'
}, content_type='application/json')
print(f"Status: {response.status_code}")
print(f"Response: {response.json() if response.status_code < 500 else response.text[:200]}")

# Test 2: Registro
print("\n📝 TEST 2: Registro (POST /api/registro/)")
print("-" * 60)
response = client.post('/api/registro/', {
    'username': 'test_user_' + str(int(__import__('time').time())),
    'password': 'TestPass123!',
    'email': f'test{int(__import__("time").time())}@test.com',
    'first_name': 'Test',
    'last_name': 'User',
    'rol': 'patient'
}, content_type='application/json')
print(f"Status: {response.status_code}")
print(f"Response: {response.json() if response.status_code < 500 else response.text[:200]}")

# Test 3: Usuario actual
print("\n👤 TEST 3: Usuario Actual (GET /api/usuario-actual/)")
print("-" * 60)
response = client.get('/api/usuario-actual/')
print(f"Status: {response.status_code}")
print(f"Response: {response.json() if response.status_code < 500 else response.text[:200]}")

# Test 4: Listar usuarios
print("\n📋 TEST 4: Listar Usuarios (GET /api/usuarios/)")
print("-" * 60)
response = client.get('/api/usuarios/')
print(f"Status: {response.status_code}")
data = response.json() if response.status_code < 500 else response.text[:200]
if isinstance(data, dict) and 'results' in data:
    print(f"Total usuarios: {data.get('count', len(data.get('results', [])))}")
else:
    print(f"Response: {data}")

print("\n" + "="*80)
print("✅ DIAGNÓSTICO COMPLETADO")
print("="*80 + "\n")

# GUÍA RÁPIDA
print("""
╔════════════════════════════════════════════════════════════════════════════╗
║                  GUÍA DE ENDPOINTS CORRECTOS - BELKIS SAÚDE              ║
╚════════════════════════════════════════════════════════════════════════════╝

🔐 AUTENTICACIÓN:
  ✓ POST   /api/token/              → Obtener token (username + password)
  ✓ POST   /api/token/refresh/      → Refrescar token
  ✓ POST   /api/token/verify/       → Verificar token
  ✓ POST   /api/registro/           → Registrar nuevo usuario

👤 USUARIO:
  ✓ GET    /api/usuario-actual/     → Obtener usuario autenticado
  ✓ GET    /api/usuarios/           → Listar usuarios (admin)
  ✓ GET    /api/usuarios/{id}/      → Obtener usuario específico
  ✓ POST   /api/cambiar-contrasena/ → Cambiar contraseña

🏥 DOCTORES:
  ✓ GET    /api/doctores/           → Listar doctores
  ✓ GET    /api/doctores-publicos/  → Doctores públicos
  ✓ GET    /api/mi-perfil-doctor/   → Mi perfil como doctor

👩‍⚕️ ENFERMERAS:
  ✓ GET    /api/enfermeras/         → Listar enfermeras
  ✓ GET    /api/mi-perfil-enfermera/ → Mi perfil como enfermera

📋 CITAS:
  ✓ GET    /api/citas/              → Listar citas
  ✓ POST   /api/citas/              → Crear cita
  ✓ GET    /api/mis-citas/          → Mis citas

📍 ESPECIALIDADES:
  ✓ GET    /api/especialidades/     → Listar especialidades
  ✓ GET    /api/especialidades-publicas/ → Especialidades públicas

🔔 NOTIFICACIONES:
  ✓ GET    /api/notificaciones/     → Listar notificaciones
  ✓ POST   /api/notificaciones/     → Crear notificación
  ✓ POST   /api/notificaciones/{id}/marcar-como-leida/ → Marcar como leída

════════════════════════════════════════════════════════════════════════════

📝 EJEMPLO DE LOGIN CORRECTO:

curl -X POST http://localhost:8000/api/token/ \\
  -H "Content-Type: application/json" \\
  -d '{
    "username": "admin",
    "password": "admin12345"
  }'

Respuesta esperada:
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}

════════════════════════════════════════════════════════════════════════════

🔐 USANDO TOKEN PARA REQUESTS:

curl -X GET http://localhost:8000/api/usuario-actual/ \\
  -H "Authorization: Bearer {tu_token_access_aqui}"

════════════════════════════════════════════════════════════════════════════
""")
