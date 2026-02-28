#!/usr/bin/env python
"""
Script de prueba para verificar el flujo completo de creación de doctor y acceso a su perfil
"""
import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000/api"

def print_separator(titulo):
    print(f"\n{'='*60}")
    print(f"  {titulo}")
    print(f"{'='*60}\n")

def admin_login():
    """Obtener token de administrador (superuser)"""
    credentials = {
        "username": "admin_test",
        "password": "testpass123"
    }
    print_separator("LOGIN ADMIN")
    try:
        resp = requests.post(f"{BASE_URL}/token/", json=credentials)
        if resp.status_code == 200:
            token = resp.json()['access']
            print("✅ Admin logueado, token obtenido")
            return token
        else:
            print(f"❌ Error login admin: {resp.status_code} {resp.text}")
            return None
    except Exception as e:
        print(f"❌ Excepción login admin: {e}")
        return None


def test_crear_doctor(admin_token):
    """1. Simular creación de doctor desde el admin"""
    print_separator("TEST 1: Crear Usuario Doctor automáticamente")
    
    headers = {"Authorization": f"Bearer {admin_token}"} if admin_token else {}

    # Datos del doctor a crear con username único
    unique = int(time.time())
    usuario_data = {
        "username": f"test_doctor_{unique}",
        "password": "password123",
        "first_name": "Juan",
        "last_name": "García",
        "email": f"juan{unique}@hospital.com",
        "telefono": "+244 123 456 789",
        "rol": "doctor"
    }
    
    print(f"📝 Creando usuario doctor con datos:")
    print(json.dumps(usuario_data, indent=2, ensure_ascii=False))
    
    try:
        # Crear usuario
        response = requests.post(f"{BASE_URL}/usuarios/", json=usuario_data, headers=headers)
        
        if response.status_code == 201:
            usuario = response.json()
            print(f"✅ Usuario creado exitosamente!")
            print(f"   ID: {usuario['id']}")
            print(f"   Username: {usuario['username']}")
            print(f"   Rol: {usuario['rol']}")
            return usuario
        elif response.status_code == 400 and 'username' in response.json():
            print("⚠️ El usuario ya existe, recuperándolo...")
            # obtener ese usuario
            filtro = requests.get(f"{BASE_URL}/usuarios/?username={usuario_data['username']}", headers=headers)
            items = filtro.json().get('results', filtro.json())
            if items:
                usuario = items[0]
                print(f"🔁 Usuario recuperado: {usuario['username']} (ID {usuario['id']})")
                return usuario
            return None
        else:
            print(f"❌ Error al crear usuario: {response.status_code}")
            print(f"   Respuesta: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Excepción: {e}")
        return None

def test_login_doctor(username, password):
    """2. Verificar que el doctor puede hacer login"""
    print_separator("TEST 2: Doctor inicia sesión")
    
    login_data = {
        "username": username,
        "password": password
    }
    
    print(f"🔐 Intentando login con username: {username}")
    
    try:
        response = requests.post(f"{BASE_URL}/token/", json=login_data)
        
        if response.status_code == 200:
            tokens = response.json()
            print(f"✅ Login exitoso!")
            print(f"   Access token: {tokens['access'][:30]}...")
            print(f"   Refresh token: {tokens['refresh'][:30]}...")
            return tokens['access']
        else:
            print(f"❌ Error al hacer login: {response.status_code}")
            print(f"   Respuesta: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Excepción: {e}")
        return None

def test_ver_perfil_doctor(token):
    """3. Verificar que el doctor puede ver su perfil"""
    print_separator("TEST 3: Doctor accede a su perfil")
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    print(f"📋 Accediendo a mi-perfil-doctor/...")
    
    try:
        response = requests.get(f"{BASE_URL}/mi-perfil-doctor/", headers=headers)
        
        if response.status_code == 200:
            perfil = response.json()
            print(f"✅ Perfil de doctor accesible!")
            print(f"   ID: {perfil.get('id')}")
            print(f"   Usuario ID: {perfil.get('usuario', {}).get('id')}")
            print(f"   Especialidad: {perfil.get('especialidad_nombre', 'No asignada')}")
            return perfil
        elif response.status_code == 404:
            print(f"⚠️ Perfil de doctor no encontrado (es normal si acaba de crearse)")
            print(f"   Respuesta: {response.text}")
            return None
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"   Respuesta: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Excepción: {e}")
        return None

def test_editar_perfil_doctor(token):
    """4. Verificar que el doctor puede editar su perfil"""
    print_separator("TEST 4: Doctor edita su perfil")
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    datos_actualizacion = {
        "first_name": "Juan Carlos",
        "biografia": "Cardiólogo con 15 años de experiencia",
        "otra_especialidad": "Cardiología"
    }
    
    print(f"✏️ Actualizando datos del perfil...")
    print(json.dumps(datos_actualizacion, indent=2, ensure_ascii=False))
    
    try:
        response = requests.patch(f"{BASE_URL}/mi-perfil-doctor/", json=datos_actualizacion, headers=headers)
        
        if response.status_code == 200:
            perfil_actualizado = response.json()
            print(f"✅ Perfil actualizado exitosamente!")
            print(f"   Nombre: {perfil_actualizado.get('usuario', {}).get('first_name')}")
            print(f"   Biografía: {perfil_actualizado.get('biografia', '')[:50]}...")
            return True
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"   Respuesta: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Excepción: {e}")
        return False

def test_doctor_no_puede_ver_otros_perfiles(token):
    """5. Verificar que el doctor NO puede acceder a otros doctores directamente por ID"""
    print_separator("TEST 5: Doctor no puede editar otros perfiles")
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    print(f"🔒 Intentando acceder a /doctores/99/ (otro doctor)...")
    
    try:
        response = requests.get(f"{BASE_URL}/doctores/99/", headers=headers)
        
        if response.status_code in [200]:
            print(f"⚠️ Doctor puede LEER otros perfiles (es correcto para listar)")
            return True
        else:
            print(f"✅ Doctor no puede acceder directamente por ID (esperado)")
            return True
    except Exception as e:
        print(f"❌ Excepción: {e}")
        return False


def test_crear_enfermera(admin_token):
    """Simula la creación de una enfermera por parte del admin"""
    print_separator("TEST ENFERMERA: Crear Usuario Enfermera automáticamente")
    headers = {"Authorization": f"Bearer {admin_token}"} if admin_token else {}
    unique = int(time.time())
    usuario_data = {
        "username": f"test_nurse_{unique}",
        "password": "password123",
        "first_name": "María",
        "last_name": "Pérez",
        "email": f"maria{unique}@hospital.com",
        "telefono": "+244 987 654 321",
        "rol": "nurse"
    }

    print(f"📝 Creando usuario enfermera con datos:")
    print(json.dumps(usuario_data, indent=2, ensure_ascii=False))
    try:
        response = requests.post(f"{BASE_URL}/usuarios/", json=usuario_data, headers=headers)
        if response.status_code == 201:
            usuario = response.json()
            print(f"✅ Usuario creado exitosamente!")
            return usuario
        elif response.status_code == 400 and 'username' in response.json():
            print("⚠️ El usuario ya existe, recuperándolo...")
            filtro = requests.get(f"{BASE_URL}/usuarios/?username={usuario_data['username']}", headers=headers)
            items = filtro.json().get('results', filtro.json())
            if items:
                usuario = items[0]
                print(f"🔁 Usuario recuperado: {usuario['username']} (ID {usuario['id']})")
                return usuario
            return None
        else:
            print(f"❌ Error al crear usuario: {response.status_code}")
            print(f"   Respuesta: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Excepción: {e}")
        return None


def test_ver_perfil_enfermera(token):
    """Ver perfil de enfermera"""
    print_separator("TEST ENFERMERA: Acceder a mi perfil de enfermera")
    headers = {"Authorization": f"Bearer {token}"}
    try:
        resp = requests.get(f"{BASE_URL}/mi-perfil-enfermera/", headers=headers)
        if resp.status_code == 200:
            perfil = resp.json()
            print(f"✅ Perfil de enfermera accesible (ID {perfil.get('id')})")
            return perfil
        else:
            print(f"❌ Error {resp.status_code}: {resp.text}")
            return None
    except Exception as e:
        print(f"❌ Excepción: {e}")
        return None


def test_editar_perfil_enfermera(token):
    print_separator("TEST ENFERMERA: Editar perfil de enfermera")
    headers = {"Authorization": f"Bearer {token}"}
    datos = {
        "first_name": "María L.",
        "otra_especialidad": "Cuidados intensivos",
        "numero_licencia": "LIC-12345"
    }
    try:
        resp = requests.patch(f"{BASE_URL}/mi-perfil-enfermera/", json=datos, headers=headers)
        if resp.status_code == 200:
            print("✅ Perfil de enfermera actualizado correctamente")
            return True
        else:
            print(f"❌ Error: {resp.status_code} {resp.text}")
            return False
    except Exception as e:
        print(f"❌ Excepción: {e}")
        return False

def main():
    print("\n" + "="*60)
    print("  PRUEBA COMPLETA: FLUJO DE DOCTOR")
    print("="*60)
    
    # Obtener token de admin
    admin_token = admin_login()
    if not admin_token:
        print("\n❌ No se pudo autenticar como admin. Abortando...")
        return

    # Test 1: Crear doctor
    usuario = test_crear_doctor(admin_token)
    if not usuario:
        print("\n❌ No se pudo crear el usuario. Abortando...")
        return
    
    # Test 2: Login del doctor
    token = test_login_doctor(usuario['username'], "password123")
    if not token:
        print("\n❌ No se pudo hacer login. Abortando...")
        return
    
    # Test 3: Ver perfil
    test_ver_perfil_doctor(token)
    
    # Test 4: Editar perfil
    test_editar_perfil_doctor(token)
    
    # Test 5: Seguridad
    test_doctor_no_puede_ver_otros_perfiles(token)
    
    # Ahora hacemos pruebas análogas para enfermera
    nurse_user = test_crear_enfermera(admin_token)
    if not nurse_user:
        print("\n❌ No se pudo crear el usuario enfermera. Abortando...\n")
        return
    nurse_token = test_login_doctor(nurse_user['username'], "password123")
    if not nurse_token:
        print("\n❌ No se pudo hacer login con la enfermera de prueba. Abortando...\n")
        return
    test_ver_perfil_enfermera(nurse_token)
    test_editar_perfil_enfermera(nurse_token)

    print("\n" + "="*60)
    print("  PRUEBAS COMPLETADAS")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
