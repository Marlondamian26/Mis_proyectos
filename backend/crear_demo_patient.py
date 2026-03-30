"""
Script para crear el usuario demo_patient si no existe.

⚠️  REQUERIMIENTO:
Este script requiere las variables de entorno DEMO_PATIENT_USERNAME y DEMO_PATIENT_PASSWORD.
Configure estas variables antes de ejecutar el script.

Ejemplo:
  DEMO_PATIENT_USERNAME=demo_patient DEMO_PATIENT_PASSWORD=secure_password python crear_demo_patient.py
"""
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.contrib.auth import get_user_model
from usuarios.models import Paciente

User = get_user_model()

def crear_demo_patient():
    """Crea el usuario demo_patient si no existe."""
    # Obtener credenciales de variables de entorno (requeridas para producción)
    username = os.environ.get('DEMO_PATIENT_USERNAME')
    password = os.environ.get('DEMO_PATIENT_PASSWORD')
    
    # Fail fast if environment variables are not set
    if not username or not password:
        print("❌ ERROR: Las variables de entorno DEMO_PATIENT_USERNAME y DEMO_PATIENT_PASSWORD son requeridas.")
        print("   Configure estas variables antes de ejecutar este script.")
        print("   Ejemplo: DEMO_PATIENT_USERNAME=demo_patient DEMO_PATIENT_PASSWORD=secure_password python crear_demo_patient.py")
        sys.exit(1)
    
    # Validate password strength
    if len(password) < 8:
        print("❌ ERROR: La contraseña debe tener al menos 8 caracteres.")
        print("   Por seguridad, use una contraseña más fuerte.")
        sys.exit(1)
    
    # Verificar si el usuario ya existe
    if User.objects.filter(username=username).exists():
        print(f"✅ El usuario '{username}' ya existe.")
        user = User.objects.get(username=username)
        
        # Verificar si tiene perfil de paciente
        if not hasattr(user, 'perfil_paciente'):
            print(f"⚠️  El usuario '{username}' no tiene perfil de paciente. Creando...")
            Paciente.objects.create(
                usuario=user,
                alergias='Ninguna conocida',
                grupo_sanguineo='O+',
                contacto_emergencia='Contacto Demo',
                telefono_emergencia='555-DEMO'
            )
            print(f"✅ Perfil de paciente creado para '{username}'.")
        else:
            print(f"✅ El usuario '{username}' ya tiene perfil de paciente.")
        return
    
    # Crear el usuario demo
    print(f"🔧 Creando usuario '{username}'...")
    user = User.objects.create_user(
        username=username,
        password=password,
        first_name='Demo',
        last_name='Patient',
        email='demo@belkis-saude.local',
        rol='patient'
    )
    print(f"✅ Usuario '{username}' creado exitosamente.")
    
    # Crear el perfil de paciente
    print(f"🔧 Creando perfil de paciente para '{username}'...")
    paciente = Paciente.objects.create(
        usuario=user,
        alergias='Ninguna conocida',
        grupo_sanguineo='O+',
        contacto_emergencia='Contacto Demo',
        telefono_emergencia='555-DEMO'
    )
    print(f"✅ Perfil de paciente creado exitosamente.")
    
    print(f"\n📋 Credenciales del usuario demo:")
    print(f"   Usuario: {username}")
    # Only show password in development/debug mode
    if os.environ.get('DEBUG', 'False').lower() == 'true':
        print(f"   Contraseña: {password}")
    else:
        print(f"   Contraseña: [HIDDEN - check environment variables]")
    print(f"\n✅ ¡Usuario demo listo para usar!")

if __name__ == '__main__':
    try:
        crear_demo_patient()
    except Exception as e:
        print(f"❌ Error al crear usuario demo: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
