from rest_framework import serializers
from .models import Usuario, Doctor, Enfermera, Paciente, Especialidad, Horario, Cita

# Serializer para Usuario (básico, sin contraseña)
class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'rol', 'telefono']
        read_only_fields = ['id']

# Serializer para registro de nuevos usuarios (con contraseña)
class RegistroUsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Usuario
        fields = ['username', 'password', 'first_name', 'last_name', 'email', 'rol', 'telefono']

    def create(self, validated_data):
        # Encripta la contraseña antes de guardar
        usuario = Usuario.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            email=validated_data.get('email', ''),
            rol=validated_data.get('rol', 'patient'),
            telefono=validated_data.get('telefono', '')
        )
        return usuario

# Serializer para Doctor
class DoctorSerializer(serializers.ModelSerializer):
    usuario = UsuarioSerializer(read_only=True)
    usuario_id = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.filter(rol='doctor'),
        source='usuario',
        write_only=True
    )

    class Meta:
        model = Doctor
        fields = ['id', 'usuario', 'usuario_id', 'especialidad', 'numero_colegiado', 'biografia']
        read_only_fields = ['id']

# Serializer para Enfermera
class EnfermeraSerializer(serializers.ModelSerializer):
    usuario = UsuarioSerializer(read_only=True)
    usuario_id = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.filter(rol='nurse'),
        source='usuario',
        write_only=True
    )

    class Meta:
        model = Enfermera
        fields = ['id', 'usuario', 'usuario_id', 'especialidad_enfermeria', 'numero_licencia']
        read_only_fields = ['id']

# Serializer para Paciente
class PacienteSerializer(serializers.ModelSerializer):
    usuario = UsuarioSerializer(read_only=True)
    usuario_id = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.filter(rol='patient'),
        source='usuario',
        write_only=True
    )

    class Meta:
        model = Paciente
        fields = ['id', 'usuario', 'usuario_id', 'alergias', 'grupo_sanguineo', 
                  'contacto_emergencia', 'telefono_emergencia']
        read_only_fields = ['id']

# Serializer para Especialidad
class EspecialidadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Especialidad
        fields = ['id', 'nombre', 'descripcion']
        read_only_fields = ['id']

# Serializer para Horario
class HorarioSerializer(serializers.ModelSerializer):
    doctor_nombre = serializers.CharField(source='doctor.usuario.get_full_name', read_only=True)
    
    class Meta:
        model = Horario
        fields = ['id', 'doctor', 'doctor_nombre', 'dia_semana', 'hora_inicio', 'hora_fin', 'activo']
        read_only_fields = ['id']

    def validate(self, data):
        """Validar que hora_fin sea después de hora_inicio"""
        if data['hora_fin'] <= data['hora_inicio']:
            raise serializers.ValidationError("La hora de fin debe ser después de la hora de inicio")
        return data

# Serializer para Cita (el más importante)
class CitaSerializer(serializers.ModelSerializer):
    paciente_nombre = serializers.CharField(source='paciente.usuario.get_full_name', read_only=True)
    doctor_nombre = serializers.CharField(source='doctor.usuario.get_full_name', read_only=True)
    
    class Meta:
        model = Cita
        fields = ['id', 'paciente', 'paciente_nombre', 'doctor', 'doctor_nombre', 
                  'fecha', 'hora', 'estado', 'motivo', 'notas_adicionales']
        read_only_fields = ['id', 'fecha_creacion', 'fecha_actualizacion']

    def validate(self, data):
        """Validar que no haya otra cita para el mismo doctor en la misma fecha y hora"""
        doctor = data.get('doctor')
        fecha = data.get('fecha')
        hora = data.get('hora')
        
        # Si es una cita existente (update), excluirla de la validación
        instance_id = self.instance.id if self.instance else None
        
        citas_existentes = Cita.objects.filter(
            doctor=doctor, 
            fecha=fecha, 
            hora=hora
        ).exclude(id=instance_id)
        
        if citas_existentes.exists():
            raise serializers.ValidationError("Ya existe una cita para este doctor en esa fecha y hora")
        
        return data