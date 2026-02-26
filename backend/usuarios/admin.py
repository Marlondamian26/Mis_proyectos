from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario, Doctor, Enfermera, Paciente, Especialidad, Horario, Cita

class UsuarioAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'rol', 'is_active')
    list_filter = ('rol', 'is_active', 'is_staff')
    fieldsets = UserAdmin.fieldsets + (
        ('Información adicional', {'fields': ('rol', 'telefono', 'foto_perfil', 'fecha_nacimiento')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Información adicional', {'fields': ('rol', 'telefono', 'fecha_nacimiento')}),
    )

admin.site.register(Usuario, UsuarioAdmin)
admin.site.register(Doctor)
admin.site.register(Enfermera)
admin.site.register(Paciente)
admin.site.register(Especialidad)
admin.site.register(Horario)
admin.site.register(Cita)