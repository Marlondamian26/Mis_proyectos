from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Crear router automático para los ViewSets
router = DefaultRouter()
router.register(r'usuarios', views.UsuarioViewSet)
router.register(r'doctores', views.DoctorViewSet)
router.register(r'enfermeras', views.EnfermeraViewSet)
router.register(r'pacientes', views.PacienteViewSet)
router.register(r'especialidades', views.EspecialidadViewSet)
router.register(r'horarios', views.HorarioViewSet)
router.register(r'citas', views.CitaViewSet)

urlpatterns = [
    # Rutas del router (genera automáticamente /api/doctores/, /api/doctores/1/, etc.)
    path('', include(router.urls)),
    
    # Rutas personalizadas
    path('registro/', views.registro_usuario, name='registro'),
    path('usuario-actual/', views.usuario_actual, name='usuario_actual'),
]