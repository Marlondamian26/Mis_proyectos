from argparse import Action
import logging

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
from .models import Usuario, Doctor, Enfermera, Paciente, Especialidad, Horario, Cita, SitioImagen

logger = logging.getLogger(__name__)

# custom token endpoint to allow login via email/telefono or username
from .serializers import CustomTokenObtainPairSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
from .serializers import (
    UsuarioSerializer, RegistroUsuarioSerializer, DoctorSerializer,
    EnfermeraSerializer, PacienteSerializer, EspecialidadSerializer,
    HorarioSerializer, CitaSerializer, SitioImagenSerializer
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
            'user': UsuarioSerializer(usuario, context={'request': request}).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Vista para obtener información del usuario actual (requiere token)
@api_view(['GET'])
@permission_classes([IsAuthenticated])  # <-- Requiere token
def usuario_actual(request):
    serializer = UsuarioSerializer(request.user, context={'request': request})
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
def especialistas_publicos(request):
    """Endpoint público para ver especialistas activos (doctores y enfermeras)"""
    # Por ahora sin cache para debugging
    doctores = Doctor.objects.select_related('usuario', 'especialidad').all()
    doctores_data = DoctorSerializer(doctores, many=True, context={'request': request}).data
    
    enfermeras = Enfermera.objects.select_related('usuario', 'especialidad').all()
    enfermeras_data = EnfermeraSerializer(enfermeras, many=True, context={'request': request}).data
    
    especialistas = []
    for doctor in doctores_data:
        doctor['tipo'] = 'doctor'
        especialistas.append(doctor)
    
    for enfermera in enfermeras_data:
        enfermera['tipo'] = 'nurse'
        especialistas.append(enfermera)
    
    return Response(especialistas)


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
    Los pacientes usan su propio perfil.
    Los admins y doctores deben especificar paciente_id.
    """
    from .ai_service import procesar_chat
    from .models import Paciente

    mensaje = request.data.get('mensaje', '').strip()
    paciente_id = request.data.get('paciente_id')

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

    # Determinar el paciente
    if request.user.rol == 'patient':
        # Pacientes usan su propio perfil
        paciente = Paciente.objects.filter(usuario=request.user).first()
        if not paciente:
            logger.warning(f"Paciente sin perfil: {request.user.username}")
            return Response(
                {'error': 'Tu cuenta no está registrada correctamente como paciente.'},
                status=status.HTTP_403_FORBIDDEN
            )
    elif request.user.rol in ['admin', 'doctor']:
        # Admins y doctores deben especificar paciente_id
        if not paciente_id:
            return Response(
                {'error': 'Debes especificar paciente_id para usar el chat como admin o doctor.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            paciente_id = int(paciente_id)
            paciente = Paciente.objects.get(id=paciente_id)
        except (ValueError, Paciente.DoesNotExist):
            return Response(
                {'error': 'Paciente no encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )
    else:
        return Response(
            {'error': 'No tienes permiso para usar esta función.'},
            status=status.HTTP_403_FORBIDDEN
        )

    # Procesar mensaje
    logger.debug(f"Chat request - Usuario: {request.user.username} ({request.user.rol}), Paciente ID: {paciente.id}")
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


# ===== BÚSQUEDA DE PACIENTES (para admin/doctor seleccionar en ChatIA) =====
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def buscar_pacientes(request):
    """
    Endpoint para buscar pacientes por nombre, apellido o username.
    Parámetros: query (string)
    Devuelve: Lista de pacientes que coinciden con la búsqueda
    """
    query = request.query_params.get('query', '').strip()
    
    if not query or len(query) < 2:
        return Response({'error': 'La búsqueda debe tener al menos 2 caracteres'}, status=status.HTTP_400_BAD_REQUEST)
    
    from django.db.models import Q
    
    # Buscar en usuarios con rol patient que coincidan con nombre, apellido o username
    usuarios_query = Usuario.objects.filter(
        Q(first_name__icontains=query) |
        Q(last_name__icontains=query) |
        Q(username__icontains=query),
        rol='patient'
    ).select_related('perfil_paciente')[:20]  # Limitar a 20 resultados
    
    resultados = []
    for usuario in usuarios_query:
        nombre_completo = f"{usuario.first_name} {usuario.last_name}".strip()
        
        # Determinar qué información mostrar
        # Si hay múltiples usuarios con el mismo nombre completo, incluir username
        usuarios_mismo_nombre = Usuario.objects.filter(
            rol='patient',
            first_name=usuario.first_name,
            last_name=usuario.last_name
        ).count()
        
        if usuarios_mismo_nombre > 1:
            # Si hay múltiples con mismo nombre y apellido, mostrar también username
            display_text = f"{nombre_completo} (@{usuario.username})"
        else:
            display_text = nombre_completo
        
        resultados.append({
            'id': usuario.perfil_paciente.id,
            'username': usuario.username,
            'first_name': usuario.first_name,
            'last_name': usuario.last_name,
            'display_text': display_text,
            'foto_perfil': usuario.foto_perfil.url if usuario.foto_perfil else None
        })
    
    return Response({'resultados': resultados})
# =========================


# ===== FOTO DE PERFIL =====
@api_view(['POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def gestionar_foto_perfil(request, usuario_id=None):
    """
    POST: Subir/actualizar foto de perfil
    DELETE: Eliminar foto de perfil
    
    Los usuarios pueden actualizar su propia foto.
    Los admins pueden actualizar la foto de cualquier usuario.
    """
    # Determinar el usuario a actualizar
    if usuario_id:
        # Admin actualizando a otro usuario
        if request.user.rol != 'admin':
            return Response({'error': 'No tienes permiso para actualizar fotos de otros usuarios'}, status=status.HTTP_403_FORBIDDEN)
        try:
            usuario = Usuario.objects.get(id=usuario_id)
        except Usuario.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    else:
        # Usuario actualizando su propia foto
        usuario = request.user
    
    if request.method == 'POST':
        # Validar que haya una imagen en el request
        if 'foto' not in request.FILES:
            return Response({'error': 'Se requiere enviar una imagen en el campo "foto"'}, status=status.HTTP_400_BAD_REQUEST)
        
        archivo_foto = request.FILES['foto']
        
        # Validar tipo de archivo
        tipos_permitidos = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if archivo_foto.content_type not in tipos_permitidos:
            return Response({'error': 'Solo se permiten imágenes (JPEG, PNG, GIF, WebP)'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validar tamaño (máx 25MB)
        if archivo_foto.size > 25 * 1024 * 1024:
            return Response({'error': 'La imagen no debe superar 25MB'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Asegurar que el directorio de media existe
        import os
        from django.conf import settings
        os.makedirs(str(settings.MEDIA_ROOT / 'perfiles'), exist_ok=True)

        # Eliminar foto antigua si existe
        if usuario.foto_perfil:
            usuario.foto_perfil.delete()

        # Guardar nueva foto
        usuario.foto_perfil = archivo_foto
        usuario.save()
        
        # Notificar si es doctor o enfermera
        if usuario.rol in ['doctor', 'nurse']:
            from notificaciones.services import ServicioNotificaciones
            ServicioNotificaciones.notificar_imagen_perfil_actualizada(usuario)
        
        serializer = UsuarioSerializer(usuario, context={'request': request})
        return Response({
            'message': 'Foto de perfil actualizada correctamente',
            'usuario': serializer.data
        }, status=status.HTTP_200_OK)
    
    elif request.method == 'DELETE':
        # Eliminar foto de perfil
        if usuario.foto_perfil:
            usuario.foto_perfil.delete()
            usuario.foto_perfil = None
            usuario.save()
        
        serializer = UsuarioSerializer(usuario, context={'request': request})
        return Response({
            'message': 'Foto de perfil eliminada correctamente',
            'usuario': serializer.data
        }, status=status.HTTP_200_OK)
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
    
    def get_queryset(self):
        user = self.request.user
        queryset = Cita.objects.all().order_by('-fecha', '-hora')
        
        paciente_id = self.request.query_params.get('paciente')
        doctor_id = self.request.query_params.get('doctor')
        if paciente_id:
            queryset = queryset.filter(paciente_id=paciente_id)
        if doctor_id:
            queryset = queryset.filter(doctor_id=doctor_id)

        if user.rol == 'paciente':
            try:
                paciente = Paciente.objects.get(usuario=user)
                return queryset.filter(paciente=paciente)
            except Paciente.DoesNotExist:
                return Cita.objects.none()
        elif user.rol in ['doctor', 'enfermera']:
            try:
                if user.rol == 'doctor':
                    perfil = Doctor.objects.get(usuario=user)
                else:
                    perfil = Enfermera.objects.get(usuario=user)
                return queryset.filter(doctor=perfil)
            except (Doctor.DoesNotExist, Enfermera.DoesNotExist):
                return Cita.objects.none()
        return queryset
    
    def create(self, request, *args, **kwargs):
        user = request.user
        data = request.data.copy()

        if user.rol == 'patient':
            try:
                paciente = Paciente.objects.get(usuario=user)
            except Paciente.DoesNotExist:
                return Response({'error': 'No tienes perfil de paciente'}, status=400)
            data['paciente'] = paciente.id
        else:
            paciente_id = data.get('paciente')
            if not paciente_id:
                return Response({'error': 'Se requiere seleccionar un paciente'}, status=400)
            if not Paciente.objects.filter(id=paciente_id).exists():
                return Response({'error': 'Paciente no encontrado'}, status=404)

        if user.rol == 'doctor' and not data.get('doctor'):
            try:
                doctor = Doctor.objects.get(usuario=user)
                data['doctor'] = doctor.id
            except Doctor.DoesNotExist:
                pass

        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    
    def perform_create(self, serializer):
        """Al crear una cita, enviar notificación"""
        cita = serializer.save()
        try:
            from notificaciones.services import ServicioNotificaciones
            ServicioNotificaciones.notificar_cita_creada(cita)
        except Exception as e:
            logger.exception('Error enviando notificación de cita creada: %s', e)
        return cita

    def perform_update(self, serializer):
        """Al actualizar una cita, enviar notificación si es necesario"""
        cita = serializer.instance
        estado_anterior = cita.estado
        fecha_anterior = cita.fecha
        hora_anterior = cita.hora
        cita = serializer.save()

        try:
            from notificaciones.services import ServicioNotificaciones

            # Detección de cambios de fecha/hora (pospuesta)
            if fecha_anterior != cita.fecha or hora_anterior != cita.hora:
                pospuesta_por = 'paciente' if self.request.user.rol == 'patient' else 'admin'
                ServicioNotificaciones.notificar_cita_pospuesta(
                    cita, 
                    pospuesta_por=pospuesta_por,
                    nueva_fecha=cita.fecha,
                    nueva_hora=cita.hora
                )
            elif estado_anterior != cita.estado:
                if cita.estado == 'cancelada':
                    cancelado_por = 'paciente' if self.request.user.rol == 'patient' else 'admin'
                    ServicioNotificaciones.notificar_cita_cancelada(cita, cancelado_por=cancelado_por)
                elif cita.estado == 'confirmada':
                    ServicioNotificaciones.notificar_cita_confirmada(cita)
        except Exception as e:
            logger.exception('Error enviando notificación de actualización de cita: %s', e)

        return cita
    
    @action(detail=True, methods=['post'])
    def cancelar(self, request, pk=None):
        """Endpoint específico para cancelar cita"""
        cita = self.get_object()
        cita.estado = 'cancelada'
        cita.save()
        
        try:
            from notificaciones.services import ServicioNotificaciones
            cancelado_por = 'paciente' if request.user.rol == 'patient' else 'admin'
            ServicioNotificaciones.notificar_cita_cancelada(cita, cancelado_por=cancelado_por)
        except Exception as e:
            logger.exception('Error enviando notificación de cita cancelada: %s', e)
        
        serializer = self.get_serializer(cita)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def confirmar(self, request, pk=None):
        """Endpoint específico para confirmar cita"""
        cita = self.get_object()
        cita.estado = 'confirmada'
        cita.save()
        
        try:
            from notificaciones.services import ServicioNotificaciones
            ServicioNotificaciones.notificar_cita_confirmada(cita)
        except Exception as e:
            logger.exception('Error enviando notificación de cita confirmada: %s', e)
        
        serializer = self.get_serializer(cita)
        return Response(serializer.data)


class SitioImagenViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar imágenes del sitio promocional"""
    queryset = SitioImagen.objects.all()
    serializer_class = SitioImagenSerializer
    
    def get_permissions(self):
        # Permitir acceso público a acciones de lectura sin autenticación
        if self.action in ['list', 'retrieve', 'carousel', 'hero']:
            return [AllowAny()]
        # También permitir si es una URL de acción personalizada sin autenticación
        if not self.request.user or not self.request.user.is_authenticated:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        queryset = SitioImagen.objects.all()
        tipo = self.request.query_params.get('tipo')
        if tipo:
            queryset = queryset.filter(tipo=tipo)
        activo = self.request.query_params.get('activo')
        if activo is not None:
            queryset = queryset.filter(activo=activo.lower() == 'true')
        return queryset
    
    @action(detail=False, methods=['get'])
    def carousel(self, request):
        """Obtener imágenes del carrusel"""
        imagenes = self.get_queryset().filter(tipo='carousel', activo=True).order_by('orden', '-fecha_creacion')
        serializer = self.get_serializer(imagenes, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def hero(self, request):
        """Obtener imagen hero"""
        imagen = self.get_queryset().filter(tipo='hero', activo=True).first()
        if imagen:
            serializer = self.get_serializer(imagen)
            return Response(serializer.data)
        return Response(None)
