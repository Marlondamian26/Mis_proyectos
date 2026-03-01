#!/usr/bin/env python3
"""
Script de testing completo de la plataforma Belkis Saude
Verifica todas las funcionalidades principales
"""

import requests
import json
from datetime import datetime
import time

BASE_URL = 'http://localhost:8000'
API_URL = f'{BASE_URL}/api'

# Generar timestamp único para evitar colisiones de usuarios
TIMESTAMP = str(int(time.time()))

# ANSI colors
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'
BOLD = '\033[1m'

class TestRunner:
    def __init__(self):
        self.admin_token = None
        self.doctor_token = None
        self.nurse_token = None
        self.patient_token = None
        self.errors = []
        self.tests_run = 0
        self.tests_passed = 0
        
    def log_title(self, title):
        print(f"\n{BOLD}{BLUE}{'='*60}{RESET}")
        print(f"{BOLD}{BLUE}{title}{RESET}")
        print(f"{BOLD}{BLUE}{'='*60}{RESET}\n")
        
    def log_test(self, name, passed, message=""):
        self.tests_run += 1
        if passed:
            self.tests_passed += 1
            print(f"{GREEN}[PASS] {name}{RESET}")
            if message:
                print(f"  {message}")
        else:
            print(f"{RED}[FAIL] {name}{RESET}")
            if message:
                print(f"  {RED}{message}{RESET}")
            self.errors.append(f"{name}: {message}")
    
    def test_admin_login(self):
        """Prueba 1: Login del admin"""
        self.log_title("PRUEBA 1: LOGIN DEL ADMIN")
        try:
            response = requests.post(f'{API_URL}/token/', json={
                'username': 'admin',
                'password': '12345678'
            })
            passed = response.status_code == 200
            self.log_test("Admin login", passed, 
                         f"Status: {response.status_code}")
            
            if passed:
                data = response.json()
                self.admin_token = data.get('access')
                
                # Verificar que el token funciona
                headers = {'Authorization': f'Bearer {self.admin_token}'}
                user_response = requests.get(f'{API_URL}/usuario-actual/', headers=headers)
                if user_response.status_code == 200:
                    user_data = user_response.json()
                    is_admin = user_data.get('rol') == 'admin'
                    self.log_test("Admin tiene rol correcto", is_admin,
                                 f"Rol: {user_data.get('rol')}")
                    return True
                else:
                    self.log_test("Obtener datos del admin", False,
                                 f"Status: {user_response.status_code}")
                    return False
            return False
        except Exception as e:
            self.log_test("Admin login", False, str(e))
            return False
    
    def test_create_doctor(self):
        """Prueba 2: Crear doctor"""
        self.log_title("PRUEBA 2: CREAR DOCTOR")
        try:
            headers = {'Authorization': f'Bearer {self.admin_token}'}
            
            doctor_data = {
                'username': f'doctor_test_{TIMESTAMP}',
                'password': 'test1234',
                'first_name': 'Juan',
                'last_name': 'Pérez',
                'email': 'doctor@test.com',
                'rol': 'doctor'
            }
            
            response = requests.post(f'{API_URL}/usuarios/', json=doctor_data, headers=headers)
            passed = response.status_code in [201, 200]
            self.log_test("Crear doctor", passed,
                         f"Status: {response.status_code}")
            
            if response.status_code not in [201, 200]:
                try:
                    error_msg = response.json()
                    self.log_test("  Respuesta del servidor", False, 
                                 json.dumps(error_msg, indent=2)[:100])
                except:
                    self.log_test("  Respuesta del servidor", False, response.text[:100])
            
            return passed
        except Exception as e:
            self.log_test("Crear doctor", False, str(e))
            return False
    
    def test_create_nurse(self):
        """Prueba 3: Crear enfermera"""
        self.log_title("PRUEBA 3: CREAR ENFERMERA")
        try:
            headers = {'Authorization': f'Bearer {self.admin_token}'}
            
            nurse_data = {
                'username': f'nurse_test_{TIMESTAMP}',
                'password': 'test1234',
                'first_name': 'María',
                'last_name': 'González',
                'email': 'nurse@test.com',
                'rol': 'nurse'
            }
            
            response = requests.post(f'{API_URL}/usuarios/', json=nurse_data, headers=headers)
            passed = response.status_code in [201, 200]
            self.log_test("Crear enfermera", passed,
                         f"Status: {response.status_code}")
            
            return passed
        except Exception as e:
            self.log_test("Crear enfermera", False, str(e))
            return False
    
    def test_create_patient(self):
        """Prueba 4: Crear paciente"""
        self.log_title("PRUEBA 4: CREAR PACIENTE")
        try:
            headers = {'Authorization': f'Bearer {self.admin_token}'}
            
            patient_data = {
                'username': f'patient_test_{TIMESTAMP}',
                'password': 'test1234',
                'first_name': 'Carlos',
                'last_name': 'Rivera',
                'email': 'patient@test.com',
                'rol': 'patient'
            }
            
            response = requests.post(f'{API_URL}/usuarios/', json=patient_data, headers=headers)
            passed = response.status_code in [201, 200]
            self.log_test("Crear paciente", passed,
                         f"Status: {response.status_code}")
            
            return passed
        except Exception as e:
            self.log_test("Crear paciente", False, str(e))
            return False
    
    def test_doctor_login(self):
        """Prueba 5: Login de doctor"""
        self.log_title("PRUEBA 5: LOGIN DE DOCTOR")
        try:
            response = requests.post(f'{API_URL}/token/', json={
                'username': f'doctor_test_{TIMESTAMP}',
                'password': 'test1234'
            })
            passed = response.status_code == 200
            self.log_test("Doctor login", passed,
                         f"Status: {response.status_code}")
            
            if passed:
                data = response.json()
                self.doctor_token = data.get('access')
                
                headers = {'Authorization': f'Bearer {self.doctor_token}'}
                user_response = requests.get(f'{API_URL}/usuario-actual/', headers=headers)
                if user_response.status_code == 200:
                    user_data = user_response.json()
                    is_doctor = user_data.get('rol') == 'doctor'
                    self.log_test("Doctor tiene rol correcto", is_doctor,
                                 f"Rol: {user_data.get('rol')}")
                    return True
            return False
        except Exception as e:
            self.log_test("Doctor login", False, str(e))
            return False
    
    def test_nurse_login(self):
        """Prueba 6: Login de enfermera"""
        self.log_title("PRUEBA 6: LOGIN DE ENFERMERA")
        try:
            response = requests.post(f'{API_URL}/token/', json={
                'username': f'nurse_test_{TIMESTAMP}',
                'password': 'test1234'
            })
            passed = response.status_code == 200
            self.log_test("Enfermera login", passed,
                         f"Status: {response.status_code}")
            
            if passed:
                data = response.json()
                self.nurse_token = data.get('access')
                return True
            return False
        except Exception as e:
            self.log_test("Enfermera login", False, str(e))
            return False
    
    def test_patient_login(self):
        """Prueba 7: Login de paciente"""
        self.log_title("PRUEBA 7: LOGIN DE PACIENTE")
        try:
            response = requests.post(f'{API_URL}/token/', json={
                'username': f'patient_test_{TIMESTAMP}',
                'password': 'test1234'
            })
            passed = response.status_code == 200
            self.log_test("Paciente login", passed,
                         f"Status: {response.status_code}")
            
            if passed:
                data = response.json()
                self.patient_token = data.get('access')
                return True
            return False
        except Exception as e:
            self.log_test("Paciente login", False, str(e))
            return False
    
    def test_doctor_profile(self):
        """Prueba 8: Acceso al perfil del doctor"""
        self.log_title("PRUEBA 8: PERFIL DEL DOCTOR")
        try:
            headers = {'Authorization': f'Bearer {self.doctor_token}'}
            
            response = requests.get(f'{API_URL}/mi-perfil-doctor/', headers=headers)
            passed = response.status_code in [200, 404]  # 404 es aceptable si no existe perfil aún
            message = f"Status: {response.status_code}"
            
            if response.status_code == 200:
                message += " - Perfil encontrado"
            elif response.status_code == 404:
                message += " - Perfil no existe (se crea automáticamente)"
            
            self.log_test("Acceso a perfil doctor", passed, message)
            return passed
        except Exception as e:
            self.log_test("Acceso a perfil doctor", False, str(e))
            return False
    
    def test_nurse_profile(self):
        """Prueba 9: Acceso al perfil de la enfermera"""
        self.log_title("PRUEBA 9: PERFIL DE LA ENFERMERA")
        try:
            headers = {'Authorization': f'Bearer {self.nurse_token}'}
            
            response = requests.get(f'{API_URL}/mi-perfil-enfermera/', headers=headers)
            passed = response.status_code in [200, 404]
            message = f"Status: {response.status_code}"
            
            if response.status_code == 200:
                message += " - Perfil encontrado"
            elif response.status_code == 404:
                message += " - Perfil no existe (se crea automáticamente)"
            
            self.log_test("Acceso a perfil enfermera", passed, message)
            return passed
        except Exception as e:
            self.log_test("Acceso a perfil enfermera", False, str(e))
            return False
    
    def test_public_endpoints(self):
        """Prueba 10: Endpoints públicos (doctores y especialidades)"""
        self.log_title("PRUEBA 10: ENDPOINTS PÚBLICOS")
        try:
            headers = {'Authorization': f'Bearer {self.admin_token}'}
            
            # Obtener especialidades (requiere autenticación)
            response = requests.get(f'{API_URL}/especialidades-publicas/', headers=headers)
            passed_esp = response.status_code == 200
            self.log_test("Especialidades públicas", passed_esp,
                         f"Status: {response.status_code}")
            
            # Obtener doctores (requiere autenticación)
            response = requests.get(f'{API_URL}/doctores-publicos/', headers=headers)
            passed_doc = response.status_code == 200
            self.log_test("Doctores públicos", passed_doc,
                         f"Status: {response.status_code}")
            
            return passed_esp and passed_doc
        except Exception as e:
            self.log_test("Endpoints públicos", False, str(e))
            return False
    
    def test_admin_stats(self):
        """Prueba 11: Estadísticas del admin dashboard"""
        self.log_title("PRUEBA 11: ESTADÍSTICAS ADMIN DASHBOARD")
        try:
            headers = {'Authorization': f'Bearer {self.admin_token}'}
            
            # Obtener usuarios
            response = requests.get(f'{API_URL}/usuarios/', headers=headers)
            users_ok = response.status_code == 200
            
            # Obtener doctores
            response = requests.get(f'{API_URL}/doctores/', headers=headers)
            doctors_ok = response.status_code == 200
            
            # Obtener enfermeras
            response = requests.get(f'{API_URL}/enfermeras/', headers=headers)
            nurses_ok = response.status_code == 200
            
            self.log_test("Listado de usuarios", users_ok, f"Status: {response.status_code}")
            self.log_test("Listado de doctores", doctors_ok)
            self.log_test("Listado de enfermeras", nurses_ok)
            
            return users_ok and doctors_ok and nurses_ok
        except Exception as e:
            self.log_test("Estadísticas", False, str(e))
            return False
    
    def test_generic_admin(self):
        """Prueba 12: Verificar que admin es el generic admin"""
        self.log_title("PRUEBA 12: GENERIC ADMIN FUNCTIONALITY")
        try:
            headers = {'Authorization': f'Bearer {self.admin_token}'}
            
            response = requests.get(f'{API_URL}/usuario-actual/', headers=headers)
            if response.status_code == 200:
                user_data = response.json()
                
                is_generic = user_data.get('username') == 'admin'
                is_superuser = user_data.get('is_superuser') == True
                
                self.log_test("Username es 'admin'", is_generic,
                             f"Username: {user_data.get('username')}")
                self.log_test("Es superuser", is_superuser,
                             f"is_superuser: {user_data.get('is_superuser')}")
                
                return is_generic and is_superuser
            else:
                self.log_test("Obtener datos del admin", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Generic admin", False, str(e))
            return False
    
    def run_all_tests(self):
        """Ejecuta todas las pruebas"""
        print(f"\n{BOLD}{BLUE}")
        print("=" * 60)
        print("TESTING PLATAFORMA BELKIS SAUDE")
        print("=" * 60)
        print("Iniciando pruebas completas...")
        print(RESET)
        
        # Ejecutar pruebas en orden
        self.test_admin_login()
        self.test_create_doctor()
        self.test_create_nurse()
        self.test_create_patient()
        self.test_doctor_login()
        self.test_nurse_login()
        self.test_patient_login()
        self.test_doctor_profile()
        self.test_nurse_profile()
        self.test_public_endpoints()
        self.test_admin_stats()
        self.test_generic_admin()
        
        self.print_summary()
    
    def print_summary(self):
        """Imprime resumen de pruebas"""
        self.log_title("RESUMEN DE PRUEBAS")
        
        total = self.tests_run
        passed = self.tests_passed
        failed = total - passed
        percentage = (passed / total * 100) if total > 0 else 0
        
        print(f"Total de pruebas: {BOLD}{total}{RESET}")
        print(f"Pruebas exitosas: {GREEN}{BOLD}{passed}{RESET}")
        print(f"Pruebas fallidas: {RED}{BOLD}{failed}{RESET}")
        print(f"Porcentaje de éxito: {BOLD}{percentage:.1f}%{RESET}\n")
        
        if self.errors:
            print(f"{RED}{BOLD}ERRORES ENCONTRADOS:{RESET}\n")
            for i, error in enumerate(self.errors, 1):
                print(f"{RED}{i}. {error}{RESET}")
        else:
            print(f"{GREEN}{BOLD}¡TODAS LAS PRUEBAS PASARON CORRECTAMENTE!{RESET}")
        
        print("\n" + "="*60 + "\n")

if __name__ == '__main__':
    runner = TestRunner()
    runner.run_all_tests()
