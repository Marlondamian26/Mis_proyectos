from rest_framework import serializers
from .models import Notificacion
from usuarios.serializers import UsuarioSerializer

class NotificacionSerializer(serializers.ModelSerializer):
    usuario_detalle = UsuarioSerializer(source='usuario', read_only=True)
    tiempo_relativo = serializers.SerializerMethodField()
    
    class Meta:
        model = Notificacion
        fields = [
            'id', 'usuario', 'usuario_detalle', 'tipo', 'titulo', 
            'mensaje', 'leida', 'estado', 'fecha_creacion', 
            'fecha_envio', 'tiempo_relativo'
        ]
        read_only_fields = ['id', 'fecha_creacion']
    
    def get_tiempo_relativo(self, obj):
        """Devuelve el tiempo en formato relativo (hace 5 minutos, etc.)"""
        from django.utils import timezone
        from django.utils.timesince import timesince
        
        if not obj.fecha_creacion:
            return ""
        
        delta = timezone.now() - obj.fecha_creacion
        
        if delta.days > 0:
            return f"hace {delta.days} día{'s' if delta.days > 1 else ''}"
        elif delta.seconds > 3600:
            horas = delta.seconds // 3600
            return f"hace {horas} hora{'s' if horas > 1 else ''}"
        elif delta.seconds > 60:
            minutos = delta.seconds // 60
            return f"hace {minutos} minuto{'s' if minutos > 1 else ''}"
        else:
            return "ahora mismo"

class NotificacionUpdateSerializer(serializers.ModelSerializer):
    """Serializer para marcar notificaciones como leídas"""
    class Meta:
        model = Notificacion
        fields = ['leida']