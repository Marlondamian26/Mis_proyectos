# Belkis-saúde 🏥

**Rama:** belkis-saude  
**Proyecto:** Sistema de Gestión para Consultorio Médico en Luanda, Angola

## 📋 Descripción
Este proyecto es un sistema completo de gestión para el consultorio de la Dra. Belkis. 
Incluye modelos para pacientes, doctores, enfermeras, citas y horarios.

## 🛠️ Tecnologías
- Backend: Django 6.0.2, Django REST Framework
- Base de datos: SQLite (desarrollo)
- Frontend: React (próximamente)

## 🚀 Cómo usar esta rama
```bash
git clone https://github.com/MarlonDamian26/mis-proyectos.git
cd mis-proyectos
git checkout belkis-saude
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver