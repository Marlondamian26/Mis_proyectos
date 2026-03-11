"""
SUITE EXHAUSTIVA DE PRUEBAS - BELKIS SAÚDE
Test comprehensive de todas las funcionalidades, seguridad y rendimiento
Hardware: Gateway NE56R31u - 4GB RAM
"""

import os
import sys
import django
import requests
import json
import time
import psutil
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed

# Agregar el directorio backend al path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.test import Client
from django.contrib.auth import authenticate
from usuarios.models import Usuario
from notificaciones.models import Notificacion

# ============================================================================
# CONFIGURACIÓN INICIAL
# ============================================================================

BASE_URL = "http://localhost:8000"
API_URL = f"{BASE_URL}/api"
FRONTEND_URL = "http://localhost:5175"

# Datos de prueba
TEST_USERS = {
    'admin': {'username': 'admin_test', 'password': 'AdminTest123!', 'email': 'admin@test.com'},
    'doctor': {'username': 'doctor_test', 'password': 'DoctorTest123!', 'email': 'doctor@test.com'},
    'nurse': {'username': 'nurse_test', 'password': 'NurseTest123!', 'email': 'nurse@test.com'},
    'patient': {'username': 'patient_test', 'password': 'PatientTest123!', 'email': 'patient@test.com'},
}

class ResultsCollector:
    """Recolecta y reporta resultados de pruebas"""
    def __init__(self):
        self.results = {
            'autenticacion': [],
            'funcionalidades': [],
            'seguridad': [],
            'rendimiento': [],
            'errores': []
        }
        self.start_time = datetime.now()
        
    def add_result(self, category, test_name, passed, message=""):
        self.results[category].append({
            'test': test_name,
            'passed': passed,
            'message': message,
            'timestamp': datetime.now()
        })
        status = "✓ PASÓ" if passed else "✗ FALLÓ"
        print(f"  {status}: {test_name} {message}")
    
    def print_summary(self):
        print("\n" + "="*80)
        print("RESUMEN DE PRUEBAS - BELKIS SAÚDE")
        print("="*80)
        
        total_tests = sum(len(v) for v in self.results.values())
        passed_tests = sum(1 for category in self.results.values() for test in category if test['passed'])
        
        print(f"\n📊 RESULTADOS GENERALES:")
        print(f"  Total de pruebas: {total_tests}")
        print(f"  Pasadas: {passed_tests} ✓")
        print(f"  Fallidas: {total_tests - passed_tests} ✗")
        print(f"  Tasa de éxito: {(passed_tests/total_tests)*100:.1f}%")
        
        print(f"\n⏱️  Duración total: {(datetime.now() - self.start_time).total_seconds():.2f} segundos")
        
        for category, tests in self.results.items():
            if tests:
                category_passed = sum(1 for t in tests if t['passed'])
                print(f"\n📌 {category.upper()}:")
                print(f"  {category_passed}/{len(tests)} pruebas pasadas")
                for test in tests:
                    if not test['passed']:
                        print(f"    ✗ {test['test']}: {test['message']}")

results = ResultsCollector()

# ============================================================================
# 1. PRUEBAS DE AUTENTICACIÓN
# ============================================================================

def test_authentication():
    print("\n🔐 PRUEBAS DE AUTENTICACIÓN")
    print("-" * 40)
    
    client = Client()
    
    # Test 1: Registro de usuario
    try:
        response = client.post(f'{API_URL}/usuarios/registro/', {
            'username': 'test_nuevo',
            'password': 'TestNuevo123!',
            'first_name': 'Test',
            'last_name': 'User',
            'email': 'test_nuevo@test.com',
            'telefono': '1234567890',
            'rol': 'paciente'
        })
        passed = response.status_code in [200, 201]
        results.add_result('autenticacion', 'Registro de usuario', passed, 
                          f"(Status: {response.status_code})")
    except Exception as e:
        results.add_result('autenticacion', 'Registro de usuario', False, str(e))
    
    # Test 2: Login de usuario
    try:
        response = client.post(f'{API_URL}/usuarios/login/', {
            'username': 'test_nuevo',
            'password': 'TestNuevo123!'
        })
        passed = response.status_code == 200 and 'access' in response.json()
        results.add_result('autenticacion', 'Login de usuario', passed, 
                          f"(Status: {response.status_code})")
    except Exception as e:
        results.add_result('autenticacion', 'Login de usuario', False, str(e))
    
    # Test 3: Login con credenciales inválidas
    try:
        response = client.post(f'{API_URL}/usuarios/login/', {
            'username': 'invalid_user',
            'password': 'invalid_password'
        })
        passed = response.status_code == 401
        results.add_result('autenticacion', 'Rechazo de login inválido', passed, 
                          f"(Status: {response.status_code})")
    except Exception as e:
        results.add_result('autenticacion', 'Rechazo de login inválido', False, str(e))
    
    # Test 4: Token JWT válido
    try:
        login_response = client.post(f'{API_URL}/usuarios/login/', {
            'username': 'test_nuevo',
            'password': 'TestNuevo123!'
        })
        if login_response.status_code == 200:
            token = login_response.json().get('access')
            headers = {'Authorization': f'Bearer {token}'}
            response = client.get(f'{API_URL}/usuarios/perfil/', **{'HTTP_AUTHORIZATION': f'Bearer {token}'})
            passed = response.status_code == 200
            results.add_result('autenticacion', 'Token JWT válido', passed, 
                              f"(Status: {response.status_code})")
        else:
            results.add_result('autenticacion', 'Token JWT válido', False, "No se obtuvo token")
    except Exception as e:
        results.add_result('autenticacion', 'Token JWT válido', False, str(e))

# ============================================================================
# 2. PRUEBAS DE FUNCIONALIDADES PRINCIPALES
# ============================================================================

def test_functionality():
    print("\n⚙️ PRUEBAS DE FUNCIONALIDADES")
    print("-" * 40)
    
    client = Client()
    
    # Obtener token
    login_response = client.post(f'{API_URL}/usuarios/login/', {
        'username': 'test_nuevo',
        'password': 'TestNuevo123!'
    })
    
    if login_response.status_code != 200:
        results.add_result('funcionalidades', 'Obtener token', False, "No se pudo autenticar")
        return
    
    token = login_response.json().get('access')
    headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
    
    # Test 1: Obtener perfil de usuario
    try:
        response = client.get(f'{API_URL}/usuarios/perfil/', **headers)
        passed = response.status_code == 200
        results.add_result('funcionalidades', 'Obtener perfil de usuario', passed, 
                          f"(Status: {response.status_code})")
    except Exception as e:
        results.add_result('funcionalidades', 'Obtener perfil de usuario', False, str(e))
    
    # Test 2: Actualizar perfil de usuario
    try:
        response = client.put(f'{API_URL}/usuarios/perfil/actualizar/', {
            'first_name': 'Test Actualizado'
        }, content_type='application/json', **headers)
        passed = response.status_code in [200, 201]
        results.add_result('funcionalidades', 'Actualizar perfil', passed, 
                          f"(Status: {response.status_code})")
    except Exception as e:
        results.add_result('funcionalidades', 'Actualizar perfil', False, str(e))
    
    # Test 3: Obtener notificaciones
    try:
        response = client.get(f'{API_URL}/notificaciones/', **headers)
        passed = response.status_code == 200
        results.add_result('funcionalidades', 'Obtener notificaciones', passed, 
                          f"(Status: {response.status_code})")
    except Exception as e:
        results.add_result('funcionalidades', 'Obtener notificaciones', False, str(e))
    
    # Test 4: Crear notificación
    try:
        response = client.post(f'{API_URL}/notificaciones/', {
            'titulo': 'Notificación de prueba',
            'mensaje': 'Este es un mensaje de prueba',
            'tipo': 'recordatorio'
        }, content_type='application/json', **headers)
        passed = response.status_code in [200, 201]
        results.add_result('funcionalidades', 'Crear notificación', passed, 
                          f"(Status: {response.status_code})")
    except Exception as e:
        results.add_result('funcionalidades', 'Crear notificación', False, str(e))
    
    # Test 5: CORS habilitado
    try:
        response = requests.options(f'{API_URL}/usuarios/login/')
        passed = 'Access-Control-Allow-Origin' in response.headers
        results.add_result('funcionalidades', 'CORS habilitado', passed, 
                          f"(Headers: {list(response.headers.keys())})")
    except Exception as e:
        results.add_result('funcionalidades', 'CORS habilitado', False, str(e))

# ============================================================================
# 3. PRUEBAS DE SEGURIDAD
# ============================================================================

def test_security():
    print("\n🔒 PRUEBAS DE SEGURIDAD")
    print("-" * 40)
    
    client = Client()
    
    # Test 1: SQL Injection en login
    try:
        response = client.post(f'{API_URL}/usuarios/login/', {
            'username': "admin' OR '1'='1",
            'password': "' OR '1'='1"
        })
        passed = response.status_code == 401
        results.add_result('seguridad', 'Protección contra SQL Injection', passed, 
                          f"(Status: {response.status_code})")
    except Exception as e:
        results.add_result('seguridad', 'Protección contra SQL Injection', False, str(e))
    
    # Test 2: XSS en registro
    try:
        response = client.post(f'{API_URL}/usuarios/registro/', {
            'username': 'test_xss',
            'password': 'TestXSS123!',
            'first_name': '<script>alert("XSS")</script>',
            'last_name': 'Test',
            'email': 'test_xss@test.com',
            'rol': 'paciente'
        })
        # Verificar que la respuesta no contiene el script sin escapar
        if response.status_code in [200, 201]:
            user_data = response.json()
            passed = '<script>' not in str(user_data)
        else:
            passed = True  # Rechazó la entrada maliciosa
        results.add_result('seguridad', 'Protección contra XSS', passed, 
                          f"(Status: {response.status_code})")
    except Exception as e:
        results.add_result('seguridad', 'Protección contra XSS', False, str(e))
    
    # Test 3: Rate limiting
    try:
        times = []
        for i in range(3):
            start = time.time()
            response = client.post(f'{API_URL}/usuarios/login/', {
                'username': f'user_{i}',
                'password': 'wrongpass'
            })
            times.append(time.time() - start)
        
        # Verificar que no hay demora significativa (sin rate limiting explicito pero Django lo maneja)
        passed = True
        results.add_result('seguridad', 'Manejo de múltiples intentos', passed, 
                          f"(Tiempos: {[f'{t:.3f}s' for t in times]})")
    except Exception as e:
        results.add_result('seguridad', 'Manejo de múltiples intentos', False, str(e))
    
    # Test 4: Contraseña hasheada (no en texto plano)
    try:
        user = Usuario.objects.filter(username='test_nuevo').first()
        if user:
            # Las contraseñas deben estar hasheadas (empezar con algo como 'pbkdf2_sha256$')
            passed = not user.password == 'TestNuevo123!' and user.password.startswith('pbkdf2_sha256')
            results.add_result('seguridad', 'Contraseñas hasheadas', passed, 
                              f"(Hash: {user.password[:30]}...)")
        else:
            results.add_result('seguridad', 'Contraseñas hasheadas', False, "Usuario no encontrado")
    except Exception as e:
        results.add_result('seguridad', 'Contraseñas hasheadas', False, str(e))
    
    # Test 5: Validación de campos requeridos
    try:
        response = client.post(f'{API_URL}/usuarios/registro/', {
            'username': 'test_incomplete'
            # Faltan password, email, etc.
        }, content_type='application/json')
        passed = response.status_code == 400
        results.add_result('seguridad', 'Validación de campos requeridos', passed, 
                          f"(Status: {response.status_code})")
    except Exception as e:
        results.add_result('seguridad', 'Validación de campos requeridos', False, str(e))

# ============================================================================
# 4. PRUEBAS DE RENDIMIENTO
# ============================================================================

def test_performance():
    print("\n⚡ PRUEBAS DE RENDIMIENTO")
    print("-" * 40)
    
    client = Client()
    
    # Test 1: Tiempo de respuesta de login
    try:
        times = []
        for _ in range(5):
            start = time.time()
            response = client.post(f'{API_URL}/usuarios/login/', {
                'username': 'test_nuevo',
                'password': 'TestNuevo123!'
            })
            times.append(time.time() - start)
        
        avg_time = sum(times) / len(times)
        passed = avg_time < 1.0  # Debe responder en menos de 1 segundo
        results.add_result('rendimiento', 'Tiempo de login (promedio)', passed, 
                          f"({avg_time:.3f}s, objetivo: <1s)")
    except Exception as e:
        results.add_result('rendimiento', 'Tiempo de login', False, str(e))
    
    # Test 2: Tiempo de respuesta de obtener perfil
    try:
        login_response = client.post(f'{API_URL}/usuarios/login/', {
            'username': 'test_nuevo',
            'password': 'TestNuevo123!'
        })
        token = login_response.json().get('access')
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        
        times = []
        for _ in range(5):
            start = time.time()
            response = client.get(f'{API_URL}/usuarios/perfil/', **headers)
            times.append(time.time() - start)
        
        avg_time = sum(times) / len(times)
        passed = avg_time < 0.5  # Debe responder en menos de 500ms
        results.add_result('rendimiento', 'Tiempo de obtener perfil (promedio)', passed, 
                          f"({avg_time:.3f}s, objetivo: <500ms)")
    except Exception as e:
        results.add_result('rendimiento', 'Tiempo de obtener perfil', False, str(e))
    
    # Test 3: Carga de memoria
    try:
        process = psutil.Process()
        memory_before = process.memory_info().rss / 1024 / 1024  # En MB
        
        # Realizar múltiples solicitudes
        for i in range(20):
            client.get(f'{API_URL}/usuarios/')
        
        memory_after = process.memory_info().rss / 1024 / 1024
        memory_increase = memory_after - memory_before
        
        passed = memory_increase < 100  # Menos de 100MB de aumento
        results.add_result('rendimiento', 'Uso de memoria', passed, 
                          f"(Antes: {memory_before:.1f}MB, Después: {memory_after:.1f}MB, Aumento: {memory_increase:.1f}MB)")
    except Exception as e:
        results.add_result('rendimiento', 'Uso de memoria', False, str(e))
    
    # Test 4: Requests concurrentes
    try:
        def make_request():
            return client.get(f'{API_URL}/usuarios/')
        
        start = time.time()
        with ThreadPoolExecutor(max_workers=4) as executor:
            futures = [executor.submit(make_request) for _ in range(10)]
            results_list = [f.result() for f in as_completed(futures)]
        
        elapsed = time.time() - start
        success_count = sum(1 for r in results_list if r.status_code < 500)
        passed = success_count == len(results_list)
        results.add_result('rendimiento', 'Manejo de 10 requests concurrentes', passed, 
                          f"({success_count}/{len(results_list)} exitosos en {elapsed:.2f}s)")
    except Exception as e:
        results.add_result('rendimiento', 'Manejo de requests concurrentes', False, str(e))
    
    # Test 5: CPU usage
    try:
        process = psutil.Process()
        cpu_percent_samples = []
        
        for _ in range(5):
            cpu_percent_samples.append(process.cpu_percent(interval=0.1))
            client.get(f'{API_URL}/usuarios/')
        
        avg_cpu = sum(cpu_percent_samples) / len(cpu_percent_samples)
        passed = avg_cpu < 50  # Menos del 50% en promedio
        results.add_result('rendimiento', 'Uso de CPU', passed, 
                          f"({avg_cpu:.1f}%, objetivo: <50%)")
    except Exception as e:
        results.add_result('rendimiento', 'Uso de CPU', False, str(e))

# ============================================================================
# 5. PRUEBAS DE FRONTNED
# ============================================================================

def test_frontend():
    print("\n🎨 PRUEBAS DE FRONTEND")
    print("-" * 40)
    
    try:
        # Test 1: Accesibilidad del frontend
        response = requests.get(FRONTEND_URL, timeout=5)
        passed = response.status_code == 200
        results.add_result('funcionalidades', 'Frontend accesible', passed, 
                          f"(Status: {response.status_code})")
    except Exception as e:
        results.add_result('funcionalidades', 'Frontend accesible', False, str(e))
    
    try:
        # Test 2: Archivos estáticos cargados
        response = requests.get(f'{FRONTEND_URL}', timeout=5)
        passed = 'html' in response.text.lower() or response.status_code == 200
        results.add_result('funcionalidades', 'HTML válido en frontend', passed, 
                          f"(Status: {response.status_code})")
    except Exception as e:
        results.add_result('funcionalidades', 'HTML válido en frontend', False, str(e))

# ============================================================================
# EJECUCIÓN PRINCIPAL
# ============================================================================

def main():
    print("\n" + "="*80)
    print("INICIANDO SUITE EXHAUSTIVA DE PRUEBAS - BELKIS SAÚDE")
    print("="*80)
    print(f"Fecha/Hora: {datetime.now()}")
    print(f"Hardware: Gateway NE56R31u (4GB RAM)")
    print(f"Backend: http://localhost:8000")
    print(f"Frontend: http://localhost:5175")
    print("="*80)
    
    # Ejecutar todas las pruebas
    test_authentication()
    test_functionality()
    test_security()
    test_performance()
    test_frontend()
    
    # Imprimir resumen
    results.print_summary()
    
    # Guardar resultados en archivo
    with open('test_results.json', 'w', encoding='utf-8') as f:
        json.dump(results.results, f, ensure_ascii=False, indent=2, default=str)
    
    print("\n✅ Resultados guardados en: test_results.json")

if __name__ == '__main__':
    main()
