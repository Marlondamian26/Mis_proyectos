from django.contrib import admin
from .models import Notificacion

@admin.register(Notificacion)
class NotificacionAdmin(admin.ModelAdmin):
    list_display = ['id', 'usuario', 'titulo', 'tipo', 'leida', 'estado', 'fecha_creacion']
    list_filter = ['leida', 'estado', 'tipo', 'fecha_creacion']
    search_fields = ['usuario__username', 'titulo', 'mensaje']
    readonly_fields = ['fecha_creacion', 'fecha_envio']
    raw_id_fields = ['usuario']
    
    fieldsets = (
        ('Información General', {
            'fields': ('usuario', 'tipo', 'titulo', 'mensaje')
        }),
        ('Estado', {
            'fields': ('leida', 'estado', 'fecha_envio')
        }),
        ('Relaciones', {
            'fields': ('content_type', 'object_id'),
            'classes': ('collapse',)
        }),
        ('Fechas', {
            'fields': ('fecha_creacion',),
            'classes': ('collapse',)
        }),
    )