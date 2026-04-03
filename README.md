# Gestion-Saude 🏥

> Sistema de Gestión para Consultorio Médico o Clínica

Este repositorio contiene la versión activa de la aplicación web que permite
administrar pacientes, doctores, enfermeras, notificaciones y agendamiento de
citas en un consultorio médico o clínica en Luanda, Angola. El proyecto se compose de un
backend Django/DRF y un frontend React/Vite.

---
## 🧩 Arquitectura

- **backend/** – aplicación Django 6.0 con autenticación JWT, modelos
dependientes de un usuario personalizado (`usuarios.models.Usuario`), y API
expuesta vía Django REST Framework. La base de datos de desarrollo es SQLite.
- **frontend/** – interfaz React (JSX) que consume los endpoints del backend. Usa
Vite para el bundling; los componentes están en `src/components`.
- `Notas` – guía de mantenimiento y comandos útiles (reinicio de base, creación
de superusuario, etc.).
- `test_*` – scripts Python de prueba que automatizan flujos de usuario (doctor,
enfermera) contra el API.

---
## 🚀 Configuración inicial

1. **Clona el repositorio** y cambia a la rama correspondiente:
   ```bash
   git clone https://github.com/MarlonDamian26/mis-proyectos.git
   cd mis-proyectos
   git checkout belkis-saude
   ```
2. **Backend**
   ```bash
   cd backend
   python -m venv venv           # crear entorno virtual
   .\venv\Scripts\activate     # Windows PowerShell
   pip install -r requirements.txt
   python manage.py migrate      # crea tablas en db.sqlite3
   ```
3. **Superusuario**
   ```bash
   python manage.py createsuperuser
   # username: belkis_admin   (o usar la comprobación/creación automática)
   ```
4. **Frontend** (desde la raíz o carpeta frontend):
   ```bash
   cd frontend
   npm install
   npm run dev                  # servidor de desarrollo en http://localhost:5173
   ```
5. Accede al frontend en el navegador y loguea con el usuario `belkis_admin`.

---
## 🔄 Reiniciar la plataforma

Si deseas borrar todos los datos y migraciones para comenzar desde cero,
delegar el proceso al documento `Notas`. Ahí encontrarás comandos paso a paso
para vaciar la base de datos, regenerar migraciones y recrear el superusuario.

El sistema incluye un *administrador genérico* (`admin` / `12345678`) que se
crea automáticamente cuando no existen superusuarios válidos. Esto garantiza
que siempre haya una forma de acceder al panel incluso después de eliminar
todos los registros o usuarios.

- Si se elimina manualmente, el usuario `admin` reaparece al reiniciar el
  servidor o realizar migraciones.
- Si se crea cualquier otro superusuario, el genérico desaparece
  automáticamente.
- Al introducir `admin` con la contraseña `12345678` en la página de login,
  el sistema te llevará al panel administrativo siempre que no haya otro
  administrador activo.

Resumen rápido de reinicio completo:
```powershell
cd backend
Remove-Item .\db.sqlite3 -ErrorAction SilentlyContinue
Remove-Item .\usuarios\migrations\*.py -Exclude __init__.py -ErrorAction SilentlyContinue
Remove-Item .\notificaciones\migrations\*.py -Exclude __init__.py -ErrorAction SilentlyContinue
python manage.py makemigrations usuarios notificaciones
python manage.py migrate
python manage.py createsuperuser  # se puede omitir; el genérico será creado automáticamente
```

---
## 🧪 Pruebas automatizadas

Hay scripts independientes (`test_doctor_workflow.py`) que ejecutan las siguientes
tareas contra un servidor en marcha:
1. crear un doctor/ enfermera desde el administrador REST
2. iniciar sesión con sus credenciales
3. acceder y modificar su propio perfil
4. verificar restricciones de acceso a datos ajenos

Puedes ejecutarlos con:
```bash
python test_doctor_workflow.py
``` 

---
## 📦 Actualizaciones y dependencias

- Actualiza `requirements.txt` con `pip freeze > requirements.txt` cuando se
instalen paquetes nuevos.
- Usa `npm update` o edita `package.json`/`package-lock.json` para el frontend.

---
## 🌱 Futuro: inteligencia artificial para reservas

Próximamente se planea integrar funciones de IA que ayuden a los pacientes a
reservar citas de forma inteligente:

- Un asistente conversacional (chatbot) podría sugerir horarios libres según
  preferencias y urgencia.
- Un modelo de recomendaciones podría priorizar turnos en base a la especialidad
del médico y al historial del paciente.
- Esto requerirá exponer algoritmos/servicios nuevos en el backend y quizá un
  componente de voz/Texto en el frontend.

Mientras planificamos, considera cómo estructuraremos los datos (por ejemplo,
almacenar tags de síntomas en las citas) y qué endpoints adicionales necesitaremos
para entrenar y consultar los modelos.

---
## 📝 Notas adicionales

El proyecto está en constante evolución; si clonas en otro equipo, sigue las
instrucciones de la sección **Restauración completa** en `Notas` para dejar el
entorno listo rápidamente.

¡Gracias por colaborar! cualquier contribución a la documentación o al código es
bienvenida.
