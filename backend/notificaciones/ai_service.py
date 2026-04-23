# ai_service module for notification handling

from .services import ServicioNotificaciones

def procesar_chat(mensaje):
    `"""Procesar mensajes del chatbot de agendamiento"""
    return ServicioNotificaciones.procesar_chat(mensaje)

def obtener_servicio(paciente_id):
    `"""Obtener el servicio de agendamiento del paciente"""
    return ServicioNotificaciones.obtener_servicio(paciente_id)
