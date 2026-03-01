from rest_framework import serializers
from .models import Usuario, Doctor, Enfermera, Paciente, Especialidad, Horario, Cita

class UsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Usuario
        fields = ['id', 'username', 'password', 'first_name', 'last_name', 'email', 'rol', 'telefono', 'foto_perfil', 'fecha_nacimiento', 'is_superuser', 'is_staff']
        read_only_fields = ['id', 'is_superuser', 'is_staff']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        usuario = super().create(validated_data)
        if password:
            usuario.set_password(password)
            usuario.save()
        return usuario

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        usuario = super().update(instance, validated_data)
        if password:
            usuario.set_password(password)
            usuario.save()
        return usuario


class RegistroUsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Usuario
        fields = ['username', 'password', 'first_name', 'last_name', 'email', 'rol', 'telefono']

    def create(self, validated_data):
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


class EspecialidadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Especialidad
        fields = ['id', 'nombre', 'descripcion', 'tipo_especialidad', 'activo']
        read_only_fields = ['id']


class DoctorSerializer(serializers.ModelSerializer):
    usuario = UsuarioSerializer(read_only=True)
    usuario_id = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.filter(rol='doctor'),
        source='usuario',
        write_only=True
    )
    especialidad_nombre = serializers.CharField(source='especialidad.nombre', read_only=True)
    especialidad_detalle = EspecialidadSerializer(source='especialidad', read_only=True)

    class Meta:
        model = Doctor
        fields = [
            'id', 'usuario', 'usuario_id', 
            'especialidad', 'especialidad_nombre', 'especialidad_detalle',
            'otra_especialidad', 'biografia'
        ]
        read_only_fields = ['id']

    def validate(self, data):
        """Validar que al menos una especialidad esté presente"""
        if not data.get('especialidad') and not data.get('otra_especialidad'):
            raise serializers.ValidationError("Debes seleccionar una especialidad o especificar 'otra especialidad'")
        return data


class EnfermeraSerializer(serializers.ModelSerializer):
    usuario = UsuarioSerializer(read_only=True)
    usuario_id = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.filter(rol='nurse'),
        source='usuario',
        write_only=True
    )
    especialidad_nombre = serializers.CharField(source='especialidad.nombre', read_only=True)
    especialidad_detalle = EspecialidadSerializer(source='especialidad', read_only=True)

    class Meta:
        model = Enfermera
        fields = [
            'id', 'usuario', 'usuario_id',
            'especialidad', 'especialidad_nombre', 'especialidad_detalle',
            'otra_especialidad', 'numero_licencia'
        ]
        read_only_fields = ['id']


class PacienteSerializer(serializers.ModelSerializer):
    usuario = UsuarioSerializer(read_only=True)
    usuario_id = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.filter(rol='patient'),
        source='usuario',
        write_only=True
    )

    class Meta:
        model = Paciente
        fields = [
            'id', 'usuario', 'usuario_id',
            'alergias', 'grupo_sanguineo',
            'contacto_emergencia', 'telefono_emergencia'
        ]
        read_only_fields = ['id']


class HorarioSerializer(serializers.ModelSerializer):
    doctor_nombre = serializers.CharField(source='doctor.usuario.get_full_name', read_only=True)
    
    class Meta:
        model = Horario
        fields = ['id', 'doctor', 'doctor_nombre', 'dia_semana', 'hora_inicio', 'hora_fin', 'activo']
        read_only_fields = ['id']

    def validate(self, data):
        if data['hora_fin'] <= data['hora_inicio']:
            raise serializers.ValidationError("La hora de fin debe ser después de la hora de inicio")
        return data


class CitaSerializer(serializers.ModelSerializer):
    paciente_nombre = serializers.CharField(source='paciente.usuario.get_full_name', read_only=True)
    doctor_nombre = serializers.CharField(source='doctor.usuario.get_full_name', read_only=True)
    
    class Meta:
        model = Cita
        fields = [
            'id', 'paciente', 'paciente_nombre', 
            'doctor', 'doctor_nombre',
            'fecha', 'hora', 'estado', 'motivo', 'notas_adicionales',
            'fecha_creacion', 'fecha_actualizacion'
        ]
        read_only_fields = ['id', 'fecha_creacion', 'fecha_actualizacion']

    def validate(self, data):
        doctor = data.get('doctor')
        fecha = data.get('fecha')
        hora = data.get('hora')
        
        instance_id = self.instance.id if self.instance else None
        
        citas_existentes = Cita.objects.filter(
            doctor=doctor, 
            fecha=fecha, 
            hora=hora
        ).exclude(id=instance_id)
        
        if citas_existentes.exists():
            raise serializers.ValidationError("Ya existe una cita para este doctor en esa fecha y hora")
        
        return data