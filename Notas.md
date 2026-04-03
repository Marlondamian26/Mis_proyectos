# # Guía de mantenimiento y reinicio 🧹
#
# Este archivo concentra un conjunto de comandos útiles para administrar el proyecto Django y, en particular, para **vaciar la base de datos y volver a partir de cero mientras se conserva al superusuario principal**.
#
# ---
# ## 1. Preparar el entorno
# 0.  ```powershell
#      python -m venv venv    <----- para crear el entorno virtual en caso de no existir.
# 1. Activa el virtualenv (Windows PowerShell):
#    ```powershell
#    .\venv\Scripts\Activate.ps1   # o .\venv\Scripts\activate
#    ```
# 2. Para salir del entorno:
#    ```powershell
#    deactivate
#    ```
# 3. Comprueba el servidor/ frontend:
#    ```powershell
#    python manage.py runserver     # iniciar backend
#    Control+C                       # detenerlo
#    npm run dev                    # arrancar frontend desde `frontend/`
#    ```
#
# ---
# ## 2. Copias de seguridad opcionales
#
# > Antes de hacer cambios drásticos puedes copiar las migraciones:
#
# ```powershell
# Copy-Item -Recurse .\usuarios\migrations .\usuarios\migrations_backup
# Copy-Item -Recurse .\notificaciones\migrations .\notificaciones\migrations_backup
# ``` 
#
# ---
# ## 3. Reiniciar la base de datos (borrar todo el contenido)
#
# Los siguientes pasos se ejecutan desde la carpeta `backend` con el entorno activado:
#
# ```powershell
# cd C:\Users\Marlon Damián\Belkis-saude\backend
#
# # 1. elimina el fichero sqlite
# Remove-Item .\db.sqlite3 -ErrorAction SilentlyContinue
#
# # 2. borra las migraciones generadas de las apps (conservando __init__.py)
# Remove-Item .\usuarios\migrations\*.py -Exclude __init__.py -ErrorAction SilentlyContinue
# Remove-Item .\notificaciones\migrations\*.py -Exclude __init__.py -ErrorAction SilentlyContinue
# # (añade otras apps aquí si las tienes)
#
# # 3. asegúrate de que los paquetes de migración existen
# New-Item -Path .\usuarios\migrations\__init__.py -ItemType File -Force
# New-Item -Path .\notificaciones\migrations\__init__.py -ItemType File -Force
#
# # 4. crea las migraciones desde cero
# python manage.py makemigrations usuarios notificaciones
# # repetir para cualquier otra app
#
# # 5. aplica todas las migraciones
# python manage.py migrate
# ```
#
# > Tras estos pasos la base de datos estará completamente limpia, sólo con las tablas vacías.
#
# ---
# ## 4. Superusuario
#
# Para conservar a la misma administradora (`belkis_admin`), crea el superusuario si no existe:
#
# ```powershell
# python manage.py shell -c "from django.contrib.auth import get_user_model; User=get_user_model();
# if not User.objects.filter(username='belkis_admin').exists():
#     User.objects.create_superuser('belkis_admin', 'belkis@example.com', 'admin123')
# print('superuser ok')"
# ```
#
# O bien, usa el comando interactivo habitual:
#
# ```powershell
# python manage.py createsuperuser
# # username: belkis_admin
# # password: admin123
# ```
#
# ---
# ## 5. Comprobaciones y tareas recurrentes
#
# - Verificar la integridad del proyecto:
#   ```powershell
#   python manage.py check
#   ```
#
# - ¿Está el superusuario presente?
#   ```powershell
#   python manage.py shell -c "from django.contrib.auth import get_user_model; U=get_user_model();
#print(U.objects.filter(username='belkis_admin',is_superuser=True).exists())"
#   ```
#
# - Crear migraciones cuando modifiques modelos:
#   ```powershell
#   python manage.py makemigrations
#   python manage.py migrate
#   ```
#
# - Ver rol de un usuario o modificarlo desde shell utilizando el modelo `usuarios.models.Usuario`.
#
# ---
# ## 6. Restauración completa (si cambia de equipo)
#
# Si vuelves a clonar el repositorio desde cero:
#
# ```powershell
# git clone <url>
# cd belkis-saude
# python -m venv venv
# .\venv\Scripts\activate
# pip install -r requirements.txt
# cd backend
# python manage.py migrate
# ```
#
# ¡tendrás un entorno idéntico al anterior!
#
# ---
# ## 7. Tips adicionales
#
# - Actualiza `requirements.txt` con `pip freeze > requirements.txt` tras instalar nuevas librerías.
# - El archivo `Notas` se puede referir cada vez que necesites reiniciar la base o revisar comandos comunes.
#
# ---
#
# ¡Listo! Mantén a mano esta guía y edítala según evolucione el proyecto.
#
# NOTA EXTRA:
# - Si se elimina el último superusuario (incluido el genérico `admin`),
#   al reiniciar el servidor Django se generará automáticamente un usuario
#   llamado `admin` con contraseña `12345678`.
# - Cuando se cree cualquier usuario con `rol='admin'` mediante la API o el
#   panel, el usuario genérico será borrado de inmediato.
#   Esto evita que quede activo más de un administrador genérico en la plataforma.
# - Para comprobar este comportamiento puedes ejecutar el script
#   `test_generic_admin.py` desde la raíz del proyecto; elimina usuarios y
#   simula varios escenarios.
#   Nota: los archivos de prueba se han movido a la carpeta `tests/`.
#   Esta carpeta contiene:
#     * `test_platform_full.py` – suite E2E completa
#     * `test_generic_admin.py` – verificación del admin genérico
#     * helpers/ – utilidades (`clean_test_users.py`, `create_test_admin.py`)
#   Otros scripts antiguos fueron eliminados para mantener el proyecto limpio.

