from argparse import Action

from rest_framework import viewsets, generics, permissions, status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.shortcuts import get_object_or_404
from django.contrib.auth import update_session_auth_hash  # <-- NUEVO IMPORT
from .models import Usuario, Doctor, Enfermera, Paciente, Especialidad, Horario, Cita
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
            Paciente.objects.create(usuario=usuario)
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


# ViewSets (todos requieren autenticación)
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
        especialidades = self.queryset.filter(tipo__in=['medica', 'ambas'], activo=True)
        serializer = self.get_serializer(especialidades, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def enfermeria(self, request):
        """Filtrar solo especialidades de enfermería"""
        especialidades = self.queryset.filter(tipo__in=['enfermeria', 'ambas'], activo=True)
        serializer = self.get_serializer(especialidades, many=True)
        return Response(serializer.data)

class HorarioViewSet(viewsets.ModelViewSet):
    queryset = Horario.objects.all()
    serializer_class = HorarioSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

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