from argparse import Action

from rest_framework import viewsets, generics, permissions, status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.throttling import UserRateThrottle
from rest_framework.decorators import throttle_classes
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.views import TokenObtainPairView
from django.shortcuts import get_object_or_404
from django.contrib.auth import update_session_auth_hash  # <-- NUEVO IMPORT
from .models import Usuario, Doctor, Enfermera, Paciente, Especialidad, Horario, Cita

# custom token endpoint to allow login via email/telefono or username
from .serializers import CustomTokenObtainPairSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
from .serializers import (
    UsuarioSerializer, RegistroUsuarioSerializer, DoctorSerializer,
    EnfermeraSerializer, PacienteSerializer, EspecialidadSerializer,
    HorarioSerializer, CitaSerializer
)
from rest_framework.decorators import action


# Vista para registro de usuarios (pública - NO requiere token)
@api_view(['POST'])
@permission_classes([AllowAny])  # <-- Cualquiera puede registrar
def registro_usuario(request):
    serializer = RegistroUsuarioSerializer(data=request.data)
    if serializer.is_valid():
        usuario = serializer.save()
        if usuario.rol == 'patient':
            # evita el error de integridad si por alguna razón ya existe
            from django.db import IntegrityError
            try:
                Paciente.objects.create(usuario=usuario)
            except IntegrityError:
                # ya había un perfil de paciente, no hagas nada
                pass
        # Devolvemos también un token para que el usuario quede logueado automáticamente
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(usuario)
        return Response({
            'user': UsuarioSerializer(usuario).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Vista para obtener información del usuario actual (requiere token)
@api_view(['GET'])
@permission_classes([IsAuthenticated])  # <-- Requiere token
def usuario_actual(request):
    serializer = UsuarioSerializer(request.user)
    return Response(serializer.data)


# ===== NUEVA FUNCIÓN =====
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cambiar_contrasena(request):
    user = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    
    if not user.check_password(old_password):
        return Response({'error': 'Contraseña actual incorrecta'}, status=status.HTTP_400_BAD_REQUEST)
    
    if len(new_password) < 4:
        return Response({'error': 'La contraseña debe tener al menos 4 caracteres'}, status=status.HTTP_400_BAD_REQUEST)
    
    user.set_password(new_password)
    user.save()
    
    # Mantener la sesión activa después de cambiar contraseña
    update_session_auth_hash(request, user)
    
    return Response({'message': 'Contraseña actualizada correctamente'}, status=status.HTTP_200_OK)
# =========================


# ===== VISTAS PÚBLICAS (para que otros roles vean datos) =====
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def especialidades_publicas(request):
    """Endpoint público para ver especialidades activas"""
    from django.core.cache import cache
    
    # Try cache first
    cache_key = 'especialidades_activas'
    cached_data = cache.get(cache_key)
    if cached_data is not None:
        return Response(cached_data)
    
    especialidades = Especialidad.objects.filter(activo=True)
    serializer = EspecialidadSerializer(especialidades, many=True)
    data = serializer.data
    
    # Cache por 5 minutos
    cache.set(cache_key, data, 300)
    
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctores_publicos(request):
    """Endpoint público para ver doctores activos"""
    from django.core.cache import cache
    
    # Try cache first
    cache_key = 'doctores_publicos'
    cached_data = cache.get(cache_key)
    if cached_data is not None:
        return Response(cached_data)
    
    # Obtener solo los doctores (no admin ni enfermeras ni pacientes)
    # Optimizado con select_related para evitar N+1 queries
    doctores = Doctor.objects.select_related('usuario', 'especialidad').all()
    serializer = DoctorSerializer(doctores, many=True)
    data = serializer.data
    
    # Cache por 5 minutos
    cache.set(cache_key, data, 300)
    
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mis_citas(request):
    """Obtener solo las citas del usuario actual"""
    user = request.user
    if user.rol == 'patient':
        # Los pacientes ven sus propias citas
        paciente = Paciente.objects.filter(usuario=user).first()
        if paciente:
            citas = Cita.objects.filter(paciente=paciente)
        else:
            citas = Cita.objects.none()
    elif user.rol == 'doctor':
        # Los doctores ven sus citas
        doctor = Doctor.objects.filter(usuario=user).first()
        if doctor:
            citas = Cita.objects.filter(doctor=doctor)
        else:
            citas = Cita.objects.none()
    elif user.rol == 'nurse':
        # Las enfermeras ven todas las citas (o podrían filtrar por departamento)
        citas = Cita.objects.all()
    else:
        # Admin ve todas
        citas = Cita.objects.all()
    
    serializer = CitaSerializer(citas, many=True)
    return Response(serializer.data)
# =========================


# ===== PERFIL PERSONAL PARA DOCTORES Y ENFERMERAS =====
@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def mi_perfil_doctor(request):
    """
    Endpoint para que un doctor vea y edite su propio perfil.
    GET: obtener perfil
    PUT/PATCH: actualizar perfil
    """
    try:
        doctor = Doctor.objects.get(usuario=request.user)
    except Doctor.DoesNotExist:
        return Response(
            {'error': 'No tienes perfil de doctor asociado'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'GET':
        serializer = DoctorSerializer(doctor)
        return Response(serializer.data)
    
    elif request.method in ['PUT', 'PATCH']:
        # Solo permitir actualizar campos específicos del perfil
        data_permitida = {
            'especialidad': request.data.get('especialidad'),
            'otra_especialidad': request.data.get('otra_especialidad', ''),
            'biografia': request.data.get('biografia', '')
        }
        
        # Permitir actualizar datos del usuario también
        if 'first_name' in request.data:
            doctor.usuario.first_name = request.data['first_name']
        if 'last_name' in request.data:
            doctor.usuario.last_name = request.data['last_name']
        if 'email' in request.data:
            doctor.usuario.email = request.data['email']
        if 'telefono' in request.data:
            doctor.usuario.telefono = request.data['telefono']
        
        doctor.usuario.save()
        
        # Actualizar perfil del doctor
        serializer = DoctorSerializer(doctor, data=data_permitida, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def mi_perfil_enfermera(request):
    """
    Endpoint para que una enfermera vea y edite su propio perfil.
    GET: obtener perfil
    PUT/PATCH: actualizar perfil
    """
    try:
        enfermera = Enfermera.objects.get(usuario=request.user)
    except Enfermera.DoesNotExist:
        return Response(
            {'error': 'No tienes perfil de enfermera asociado'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'GET':
        serializer = EnfermeraSerializer(enfermera)
        return Response(serializer.data)
    
    elif request.method in ['PUT', 'PATCH']:
        # Solo permitir actualizar campos específicos del perfil
        data_permitida = {
            'especialidad': request.data.get('especialidad'),
            'otra_especialidad': request.data.get('otra_especialidad', ''),
            'numero_licencia': request.data.get('numero_licencia', '')
        }
        
        # Permitir actualizar datos del usuario también
        if 'first_name' in request.data:
            enfermera.usuario.first_name = request.data['first_name']
        if 'last_name' in request.data:
            enfermera.usuario.last_name = request.data['last_name']
        if 'email' in request.data:
            enfermera.usuario.email = request.data['email']
        if 'telefono' in request.data:
            enfermera.usuario.telefono = request.data['telefono']
        
        enfermera.usuario.save()
        
        # Actualizar perfil de enfermera
        serializer = EnfermeraSerializer(enfermera, data=data_permitida, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
# =========================


# ViewSets (todos requieren autenticación)
# ===== CHAT IA =====
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@throttle_classes([UserRateThrottle])
def chat_ia(request):
    """
    Endpoint para el asistente de IA de agendamiento de citas.
    """
    from .ai_service import procesar_chat
    from .models import Paciente
    
    mensaje = request.data.get('mensaje', '').strip()
    
    if not mensaje:
        return Response(
            {'error': 'El mensaje no puede estar vacío'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if len(mensaje) > 500:
        return Response(
            {'error': 'El mensaje no puede exceder 500 caracteres'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Obtener el paciente
    paciente = Paciente.objects.filter(usuario=request.user).first()
    
    if not paciente:
        logger.warning(f"Intento de chat por usuario no-paciente: {request.user.username}")
        return Response(
            {'error': 'Tu cuenta no está registrada como paciente. Esta función es solo para pacientes.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Procesar mensaje
    logger.debug(f"Chat request - Usuario: {request.user.username}, Paciente ID: {paciente.id}")
    respuesta = procesar_chat(paciente.id, mensaje)
    
    return Response({
        'respuesta': respuesta
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@throttle_classes([UserRateThrottle])
def chat_ia_sugerencias(request):
    """
    Endpoint para obtener sugerencias según el contexto.
    """
    from .ai_service import obtener_servicio
    from .models import Paciente
    
    paciente = Paciente.objects.filter(usuario=request.user).first()
    
    if not paciente:
        return Response({'sugerencias': []})
    
    servicio = obtener_servicio(paciente.id)
    sugerencias = servicio.obtener_sugerencias() if servicio else []
    
    return Response({'sugerencias': sugerencias})
# =========================


class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]  # <-- Requiere token
    authentication_classes = [JWTAuthentication]  # <-- Usa JWT

class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

class EnfermeraViewSet(viewsets.ModelViewSet):
    queryset = Enfermera.objects.all()
    serializer_class = EnfermeraSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

class PacienteViewSet(viewsets.ModelViewSet):
    queryset = Paciente.objects.all()
    serializer_class = PacienteSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

class EspecialidadViewSet(viewsets.ModelViewSet):
    queryset = Especialidad.objects.all()
    serializer_class = EspecialidadSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    @action(detail=False, methods=['get'])
    def medicas(self, request):
        """Filtrar solo especialidades médicas"""
        especialidades = self.queryset.filter(tipo_especialidad='medica', activo=True)  
        serializer = self.get_serializer(especialidades, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def enfermeria(self, request):
        """Filtrar solo especialidades de enfermería"""
        especialidades = self.queryset.filter(tipo_especialidad__in=['enfermeria', 'ambas'], activo=True)
        serializer = self.get_serializer(especialidades, many=True)
        return Response(serializer.data)

class HorarioViewSet(viewsets.ModelViewSet):
    queryset = Horario.objects.all()
    serializer_class = HorarioSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        queryset = super().get_queryset()
        doctor_id = self.request.query_params.get('doctor')
        if doctor_id:
            queryset = queryset.filter(doctor_id=doctor_id)
        return queryset

    @action(detail=False, methods=['get'])
    def disponibles(self, request):
        """Obtener horarios disponibles para un doctor en una fecha específica"""
        doctor_id = request.query_params.get('doctor')
        fecha = request.query_params.get('fecha')
        
        if not doctor_id:
            return Response({'error': 'Se requiere el parámetro doctor'}, status=400)
        
        try:
            doctor = Doctor.objects.get(id=doctor_id)
        except Doctor.DoesNotExist:
            return Response({'error': 'Doctor no encontrado'}, status=404)
        
        if fecha:
            from datetime import datetime
            try:
                fecha_date = datetime.strptime(fecha, '%Y-%m-%d').date()
                dia_semana = fecha_date.weekday()
                horarios = Horario.objects.filter(
                    doctor=doctor,
                    dia_semana=dia_semana,
                    activo=True
                )
            except ValueError:
                return Response({'error': 'Formato de fecha inválido. Use YYYY-MM-DD'}, status=400)
        else:
            horarios = Horario.objects.filter(doctor=doctor, activo=True)
        
        serializer = HorarioSerializer(horarios, many=True)
        return Response(serializer.data)

class CitaViewSet(viewsets.ModelViewSet):
    queryset = Cita.objects.all()
    serializer_class = CitaSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        """Al crear una cita, enviar notificación"""
        cita = serializer.save()
        # Importación diferida para evitar dependencia circular
        from notificaciones.services import ServicioNotificaciones
        # Notificar al paciente que su cita fue creada
        ServicioNotificaciones.notificar_cita_creada(cita)
        return cita
    
    def perform_update(self, serializer):
        """Al actualizar una cita, enviar notificación si es necesario"""
        cita = serializer.save()
        
        # Importación diferida
        from notificaciones.services import ServicioNotificaciones
        
        # Si la cita fue cancelada
        if cita.estado == 'cancelada':
            ServicioNotificaciones.notificar_cita_cancelada(cita, cancelado_por='admin')
        
        # Si la cita fue confirmada
        elif cita.estado == 'confirmada':
            ServicioNotificaciones.notificar_cita_confirmada(cita)
        
        return cita
    
    @action(detail=True, methods=['post'])
    def cancelar(self, request, pk=None):
        """Endpoint específico para cancelar cita"""
        cita = self.get_object()
        cita.estado = 'cancelada'
        cita.save()
        
        # Importación diferida
        from notificaciones.services import ServicioNotificaciones
        # Enviar notificaciones
        ServicioNotificaciones.notificar_cita_cancelada(cita, cancelado_por='admin')
        
        serializer = self.get_serializer(cita)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def confirmar(self, request, pk=None):
        """Endpoint específico para confirmar cita"""
        cita = self.get_object()
        cita.estado = 'confirmada'
        cita.save()
        
        # Importación diferida
        from notificaciones.services import ServicioNotificaciones
        # Enviar notificaciones
        ServicioNotificaciones.notificar_cita_confirmada(cita)
        
        serializer = self.get_serializer(cita)
        return Response(serializer.data)
