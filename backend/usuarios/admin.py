from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from .models import Usuario, Doctor, Enfermera, Paciente, Especialidad, Horario, Cita

class UsuarioAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'rol', 'is_active', 'is_staff')
    list_filter = ('rol', 'is_active', 'is_staff', 'is_superuser')
    search_fields = ('username', 'first_name', 'last_name', 'email')
    ordering = ('-date_joined',)
    
    fieldsets = UserAdmin.fieldsets + (
        ('Información adicional', {
            'fields': ('rol', 'telefono', 'foto_perfil', 'fecha_nacimiento'),
            'classes': ('wide',)
        }),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Información adicional', {
            'fields': ('rol', 'telefono', 'fecha_nacimiento', 'first_name', 'last_name', 'email'),
            'classes': ('wide',)
        }),
    )

# Registrar UsuarioAdmin PRIMERO (importante para el autocomplete)
admin.site.register(Usuario, UsuarioAdmin)


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre_completo', 'especialidad_mostrar', 'biografia_resumida')
    list_filter = ('especialidad',)
    search_fields = ('usuario__first_name', 'usuario__last_name', 'otra_especialidad')
    raw_id_fields = ('usuario',)
    # El autocomplete_fields funciona porque UsuarioAdmin ya está registrado con search_fields
    autocomplete_fields = ['usuario']
    
    fieldsets = (
        ('Información del Usuario', {
            'fields': ('usuario',)
        }),
        ('Información Profesional', {
            'fields': ('especialidad', 'otra_especialidad', 'biografia'),
            'description': 'Selecciona una especialidad existente o escribe una nueva en "Otra especialidad"'
        }),
    )
    
    def nombre_completo(self, obj):
        return f"Dr. {obj.usuario.first_name} {obj.usuario.last_name}"
    nombre_completo.short_description = 'Nombre completo'
    nombre_completo.admin_order_field = 'usuario__first_name'
    
    def especialidad_mostrar(self, obj):
        if obj.especialidad:
            return obj.especialidad.nombre
        elif obj.otra_especialidad:
            return f"{obj.otra_especialidad} (nueva)"
        return "Sin especificar"
    especialidad_mostrar.short_description = 'Especialidad'
    
    def biografia_resumida(self, obj):
        if obj.biografia:
            return obj.biografia[:50] + '...' if len(obj.biografia) > 50 else obj.biografia
        return '-'
    biografia_resumida.short_description = 'Biografía'


@admin.register(Enfermera)
class EnfermeraAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre_completo', 'especialidad_mostrar', 'numero_licencia')
    list_filter = ('especialidad',)
    search_fields = ('usuario__first_name', 'usuario__last_name', 'numero_licencia')
    raw_id_fields = ('usuario',)
    autocomplete_fields = ['usuario']
    
    fieldsets = (
        ('Información del Usuario', {
            'fields': ('usuario',)
        }),
        ('Información Profesional', {
            'fields': ('especialidad', 'otra_especialidad', 'numero_licencia'),
            'description': 'La especialidad es opcional. Puedes seleccionar una existente o escribir una nueva.'
        }),
    )
    
    def nombre_completo(self, obj):
        return f"Enf. {obj.usuario.first_name} {obj.usuario.last_name}"
    nombre_completo.short_description = 'Nombre completo'
    
    def especialidad_mostrar(self, obj):
        if obj.especialidad:
            return obj.especialidad.nombre
        elif obj.otra_especialidad:
            return f"{obj.otra_especialidad} (nueva)"
        return "Sin especialidad"
    especialidad_mostrar.short_description = 'Especialidad'


@admin.register(Paciente)
class PacienteAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre_completo', 'grupo_sanguineo', 'contacto_emergencia')
    list_filter = ('grupo_sanguineo',)
    search_fields = ('usuario__first_name', 'usuario__last_name', 'contacto_emergencia')
    raw_id_fields = ('usuario',)
    autocomplete_fields = ['usuario']
    
    fieldsets = (
        ('Información del Usuario', {
            'fields': ('usuario',)
        }),
        ('Información Médica', {
            'fields': ('alergias', 'grupo_sanguineo')
        }),
        ('Contacto de Emergencia', {
            'fields': ('contacto_emergencia', 'telefono_emergencia')
        }),
    )
    
    def nombre_completo(self, obj):
        return f"{obj.usuario.first_name} {obj.usuario.last_name}"
    nombre_completo.short_description = 'Nombre completo'


@admin.register(Especialidad)
class EspecialidadAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'tipo_especialidad', 'activo', 'total_doctores', 'total_enfermeras')
    list_filter = ('tipo_especialidad', 'activo')
    search_fields = ('nombre', 'descripcion')
    list_editable = ('activo',)
    
    fieldsets = (
        (None, {
            'fields': ('nombre', 'descripcion', 'tipo_especialidad', 'activo')
        }),
    )
    
    def total_doctores(self, obj):
        return Doctor.objects.filter(especialidad=obj).count()
    total_doctores.short_description = 'Doctores'
    
    def total_enfermeras(self, obj):
        return Enfermera.objects.filter(especialidad=obj).count()
    total_enfermeras.short_description = 'Enfermeras'


@admin.register(Horario)
class HorarioAdmin(admin.ModelAdmin):
    list_display = ('id', 'doctor', 'dia_semana_display', 'hora_inicio', 'hora_fin', 'activo')
    list_filter = ('activo', 'dia_semana')
    search_fields = ('doctor__usuario__first_name', 'doctor__usuario__last_name')
    list_editable = ('activo',)
    autocomplete_fields = ['doctor']
    
    def dia_semana_display(self, obj):
        dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
        return dias[obj.dia_semana]
    dia_semana_display.short_description = 'Día'
    dia_semana_display.admin_order_field = 'dia_semana'


@admin.register(Cita)
class CitaAdmin(admin.ModelAdmin):
    list_display = ('id', 'paciente_nombre', 'doctor_nombre', 'fecha', 'hora', 'estado_coloreado')
    list_filter = ('estado', 'fecha')
    search_fields = ('paciente__usuario__first_name', 'doctor__usuario__first_name', 'motivo')
    date_hierarchy = 'fecha'
    raw_id_fields = ('paciente', 'doctor')
    autocomplete_fields = ['paciente', 'doctor']
    
    fieldsets = (
        ('Información de la Cita', {
            'fields': ('paciente', 'doctor', 'fecha', 'hora', 'estado')
        }),
        ('Detalles', {
            'fields': ('motivo', 'notas_adicionales')
        }),
        ('Auditoría', {
            'fields': ('fecha_creacion', 'fecha_actualizacion'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ('fecha_creacion', 'fecha_actualizacion')
    
    def paciente_nombre(self, obj):
        return f"{obj.paciente.usuario.first_name} {obj.paciente.usuario.last_name}"
    paciente_nombre.short_description = 'Paciente'
    
    def doctor_nombre(self, obj):
        return f"Dr. {obj.doctor.usuario.first_name} {obj.doctor.usuario.last_name}"
    doctor_nombre.short_description = 'Doctor'
    
    def estado_coloreado(self, obj):
        colores = {
            'pendiente': '#f39c12',
            'confirmada': '#27ae60',
            'completada': '#3498db',
            'cancelada': '#e74c3c',
            'no_asistio': '#95a5a6'
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px;">{}</span>',
            colores.get(obj.estado, '#95a5a6'),
            obj.get_estado_display()
        )
    estado_coloreado.short_description = 'Estado'