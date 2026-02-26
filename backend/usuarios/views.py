from rest_framework import viewsets, generics, permissions, status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication  # <-- NUEVO
from django.shortcuts import get_object_or_404
from .models import Usuario, Doctor, Enfermera, Paciente, Especialidad, Horario, Cita
from .serializers import (
    UsuarioSerializer, RegistroUsuarioSerializer, DoctorSerializer,
    EnfermeraSerializer, PacienteSerializer, EspecialidadSerializer,
    HorarioSerializer, CitaSerializer
)

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

class HorarioViewSet(viewsets.ModelViewSet):
    queryset = Horario.objects.all()
    serializer_class = HorarioSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

class CitaViewSet(viewsets.ModelViewSet):
    queryset = Cita.objects.all()
    serializer_class = CitaSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def get_queryset(self):
        user = self.request.user
        if user.rol == 'patient':
            paciente = get_object_or_404(Paciente, usuario=user)
            return Cita.objects.filter(paciente=paciente)
        elif user.rol == 'doctor':
            doctor = get_object_or_404(Doctor, usuario=user)
            return Cita.objects.filter(doctor=doctor)
        elif user.rol == 'nurse':
            return Cita.objects.all()
        return Cita.objects.all()