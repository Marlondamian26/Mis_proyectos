# ============================================================
#   RESUMEN GENERAL — Clonar un proyecto desde GitHub y 
#   configurarlo desde cero en Visual Studio Code
# ============================================================

# ------------------------------------------------------------
# 1. Preparar el entorno
# ------------------------------------------------------------

# Verificar que Git está instalado:
#   git --version

# Verificar que VS Code reconoce Git:
#   git --version
# (Si responde, VS Code está conectado a Git)

# ------------------------------------------------------------
# 2. Obtener la URL del repositorio en GitHub
# ------------------------------------------------------------

# En GitHub:
#   - Abrir el repositorio
#   - Pulsar "Code"
#   - Copiar la URL HTTPS:
#       https://github.com/usuario/repositorio.git

# ------------------------------------------------------------
# 3. Clonar el repositorio
# ------------------------------------------------------------

# Método visual desde VS Code:
#   - Ctrl + Shift + P
#   - Escribir: Git: Clone
#   - Pegar la URL del repo
#   - Elegir carpeta destino
#   - Abrir el repositorio cuando VS Code lo pregunte

# Método por terminal (solo una rama específica):
#   git clone --branch nombre-rama --single-branch https://github.com/usuario/repositorio.git

# ------------------------------------------------------------
# 4. Abrir el proyecto en VS Code
# ------------------------------------------------------------

# Si no se abrió automáticamente:
#   VS Code → File → Open Folder → seleccionar la carpeta clonada

# Debe aparecer la rama activa en la barra inferior (ej. main, dev)

# ------------------------------------------------------------
# 5. Permitir ejecución de scripts en PowerShell (solo por sesión)
# ------------------------------------------------------------

# Necesario para:
#   - Activar entornos virtuales de Python
#   - Ejecutar npm en Windows

# Ejecutar:
#   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# ------------------------------------------------------------
# 6. Configurar el backend (Python + Django)
# ------------------------------------------------------------

# Crear entorno virtual dentro de la carpeta backend:
#   python -m venv venv

# Activar entorno virtual:
#   .\venv\Scripts\Activate.ps1

# Instalar dependencias del backend:
#   pip install -r requirements.txt
# (Si no existe requirements.txt, instalar Django manualmente)
#   pip install django

# Probar el backend:
#   python manage.py runserver

# ------------------------------------------------------------
# 7. Configurar el frontend (React)
# ------------------------------------------------------------

# Entrar a la carpeta del frontend:
#   cd frontend

# Instalar dependencias:
#   npm install

# Ejecutar el frontend:
#   npm run dev
#   (o npm start según el proyecto)

# ------------------------------------------------------------
# 8. Verificar funcionamiento
# ------------------------------------------------------------

# Backend:
#   http://127.0.0.1:8000/

# Frontend:
#   http://localhost:5173/
#   o http://localhost:3000/

# ------------------------------------------------------------
# 9. (Opcional) Iniciar sesión en GitHub desde VS Code
# ------------------------------------------------------------

#   - Ctrl + Shift + P
#   - GitHub: Sign in
#   - Autorizar desde el navegador

# Esto permite hacer push/pull sin contraseñas.

# ------------------------------------------------------------
# RESUMEN ULTRA-CORTO
# ------------------------------------------------------------

# git clone URL
# Abrir carpeta en VS Code
# Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
# Backend:
#   python -m venv venv
#   .\venv\Scripts\Activate.ps1
#   pip install -r requirements.txt
#   python manage.py runserver
# Frontend:
#   cd frontend
#   npm install
#   npm run dev

# ============================================================
# FIN DEL RESUMEN
# ============================================================
