#!/usr/bin/env python
"""
CORRECCIÓN RÁPIDA: Script para probar endpoints correctos de autenticación
Ejecutar: python validate_auth_endpoints.py
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"

print("\n" + "="*80)
print("VALIDACIÓN RÁPIDA DE ENDPOINTS DE AUTENTICACIÓN")
print("="*80 + "\n")

# Test 1: Login con admin (usuario por defecto)
print("🔐 TEST 1: Login con usuario admin")
print("-" * 60)

try:
    response = requests.post(
        f"{BASE_URL}/api/token/",
        json={
            "username": "admin",
            "password": "admin12345"
        },
        timeout=5
    )
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        token = data.get('access')
        print(f"✅ LOGIN EXITOSO")
        print(f"Access Token: {token[:50]}...")
        print(f"Refresh Token: {data.get('refresh', '')[:50]}...")
        
        # Test 2: Usar token para obtener usuario actual
        print("\n👤 TEST 2: Obtener usuario actual (usando token)")
        print("-" * 60)
        
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        response2 = requests.get(
            f"{BASE_URL}/api/usuario-actual/",
            headers=headers,
            timeout=5
        )
        
        print(f"Status Code: {response2.status_code}")
        if response2.status_code == 200:
            user_data = response2.json()
            print(f"✅ USUARIO OBTENIDO")
            print(f"Username: {user_data.get('username')}")
            print(f"Role: {user_data.get('rol')}")
            print(f"Email: {user_data.get('email')}")
        else:
            print(f"❌ ERROR: {response2.text[:200]}")
    else:
        print(f"❌ LOGIN FALLIDO")
        print(f"Response: {response.text[:200]}")

except requests.exceptions.ConnectionError:
    print("❌ ERROR: No se puede conectar al servidor")
    print("   Asegúrate de que Django está corriendo en http://localhost:8000")
except Exception as e:
    print(f"❌ ERROR: {str(e)}")

# Test 3: Registro (si user no existe)
print("\n📝 TEST 3: Registrar nuevo usuario")
print("-" * 60)

try:
    timestamp = int(time.time())
    new_user = {
        "username": f"newuser_{timestamp}",
        "password": "NewUser123!",
        "email": f"newuser_{timestamp}@test.com",
        "first_name": "Test",
        "last_name": "User",
        "telefono": "1234567890",
        "rol": "patient"
    }
    
    response = requests.post(
        f"{BASE_URL}/api/registro/",
        json=new_user,
        timeout=5
    )
    
    print(f"Status Code: {response.status_code}")
    if response.status_code in [200, 201]:
        data = response.json()
        print(f"✅ REGISTRO EXITOSO")
        print(f"Usuario creado: {data.get('username')}")
    else:
        print(f"❌ REGISTRO FALLIDO")
        print(f"Response: {response.text[:200]}")
        
except Exception as e:
    print(f"❌ ERROR: {str(e)}")

print("\n" + "="*80)
print("✅ VALIDACIÓN COMPLETADA")
print("="*80 + "\n")

# Guía rápida
print("""
╔════════════════════════════════════════════════════════════════════════════╗
║                   GUÍA DE ENDPOINTS CORRECTOS                             ║
╚════════════════════════════════════════════════════════════════════════════╝

✓ CORRECTO:
  POST /api/token/               → Login (username + password)
  POST /api/registro/            → Registrar usuario
  GET  /api/usuario-actual/      → Obtener usuario autenticado
  
✗ INCORRECTO (No usar):
  POST /api/usuarios/login/      ← No existe
  POST /api/usuarios/registro/   ← No existe

════════════════════════════════════════════════════════════════════════════

📝 EJEMPLO CURL PARA LOGIN:

curl -X POST http://localhost:8000/api/token/ \\
  -H "Content-Type: application/json" \\
  -d '{"username":"admin","password":"admin12345"}'

════════════════════════════════════════════════════════════════════════════

📝 USAR TOKEN EN REQUESTS:

curl -X GET http://localhost:8000/api/usuario-actual/ \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

════════════════════════════════════════════════════════════════════════════
""")
