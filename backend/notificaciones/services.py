from django.core.mail import send_mail
from django.utils import timezone
from django.conf import settings
from twilio.rest import Client
import requests
from .models import Notificacion

class ServicioNotificaciones:
    
    @staticmethod
    def enviar_email(destinatario, asunto, mensaje):
        """Enviar notificación por email"""
        try:
            send_mail(
                asunto,
                mensaje,
                settings.EMAIL_HOST_USER,
                [destinatario],
                fail_silently=False,
            )
            return True, "Email enviado correctamente"
        except Exception as e:
            return False, str(e)
    
    @staticmethod
    def enviar_whatsapp(destinatario, mensaje):
        """Enviar notificación por WhatsApp (requiere Twilio)"""
        try:
            client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            message = client.messages.create(
                body=mensaje,
                from_=f'whatsapp:{settings.TWILIO_WHATSAPP_NUMBER}',
                to=f'whatsapp:{destinatario}'
            )
            return True, "WhatsApp enviado correctamente"
        except Exception as e:
            return False, str(e)
    
    @staticmethod
    def crear_notificacion(usuario, tipo, titulo, mensaje, objeto_relacionado=None):
        """Crear una notificación en la base de datos"""
        notificacion = Notificacion.objects.create(
            usuario=usuario,
            tipo=tipo,
            titulo=titulo,
            mensaje=mensaje,
            estado='pendiente'
        )
        
        if objeto_relacionado:
            content_type = ContentType.objects.get_for_model(objeto_relacionado)
            notificacion.content_type = content_type
            notificacion.object_id = objeto_relacionado.id
            notificacion.save()
        
        return notificacion
    
    @classmethod
    def notificar_cita_creada(cls, cita):
        """Notificar al paciente que su cita fue creada"""
        paciente = cita.paciente.usuario
        mensaje = f"""
        🏥 Belkis-saúde - Confirmación de Cita
        
        Hola {paciente.first_name},
        
        Tu cita ha sido registrada exitosamente:
        
        📅 Fecha: {cita.fecha}
        ⏰ Hora: {cita.hora}
        👨‍⚕️ Doctor: Dr. {cita.doctor.usuario.first_name} {cita.doctor.usuario.last_name}
        📋 Motivo: {cita.motivo}
        
        Por favor, confirma tu asistencia 24 horas antes.
        
        Gracias por confiar en nosotros.
        """
        
        return cls.crear_notificacion(
            usuario=paciente,
            tipo='nueva_cita',
            titulo='Cita Registrada',
            mensaje=mensaje,
            objeto_relacionado=cita
        )
    
    @classmethod
    def notificar_recordatorio_cita(cls, cita):
        """Enviar recordatorio 24 horas antes de la cita"""
        paciente = cita.paciente.usuario
        doctor = cita.doctor.usuario
        
        mensaje_paciente = f"""
        🔔 Recordatorio de Cita - Belkis-saúde
        
        Hola {paciente.first_name},
        
        Te recordamos que tienes una cita mañana:
        
        📅 Fecha: {cita.fecha}
        ⏰ Hora: {cita.hora}
        👨‍⚕️ Doctor: Dr. {doctor.first_name} {doctor.last_name}
        
        Responde a este mensaje para confirmar o cancelar.
        
        1️⃣ - Confirmar asistencia
        2️⃣ - Cancelar cita
        """
        
        # Crear notificación para el paciente
        cls.crear_notificacion(
            usuario=paciente,
            tipo='recordatorio_cita',
            titulo='Recordatorio de Cita - Mañana',
            mensaje=mensaje_paciente,
            objeto_relacionado=cita
        )
        
        # También notificar al doctor
        mensaje_doctor = f"""
        🔔 Recordatorio de Cita - Belkis-saúde
        
        Dr. {doctor.first_name},
        
        Tienes una cita programada para mañana:
        
        📅 Fecha: {cita.fecha}
        ⏰ Hora: {cita.hora}
        👤 Paciente: {paciente.first_name} {paciente.last_name}
        📋 Motivo: {cita.motivo}
        """
        
        return cls.crear_notificacion(
            usuario=doctor,
            tipo='recordatorio_cita',
            titulo='Recordatorio de Cita - Mañana',
            mensaje=mensaje_doctor,
            objeto_relacionado=cita
        )
    
    @classmethod
    def notificar_cita_confirmada(cls, cita):
        """Notificar que el paciente confirmó la cita"""
        paciente = cita.paciente.usuario
        doctor = cita.doctor.usuario
        
        mensaje_paciente = f"""
        ✅ Cita Confirmada - Belkis-saúde
        
        Hola {paciente.first_name},
        
        Tu cita ha sido confirmada:
        
        📅 Fecha: {cita.fecha}
        ⏰ Hora: {cita.hora}
        👨‍⚕️ Doctor: Dr. {doctor.first_name} {doctor.last_name}
        
        Te esperamos!
        """
        
        # Notificar al paciente
        cls.crear_notificacion(
            usuario=paciente,
            tipo='confirmacion_cita',
            titulo='Cita Confirmada',
            mensaje=mensaje_paciente,
            objeto_relacionado=cita
        )
        
        # Notificar al doctor
        mensaje_doctor = f"""
        ✅ Cita Confirmada - Belkis-saúde
        
        Dr. {doctor.first_name},
        
        El paciente {paciente.first_name} {paciente.last_name} ha confirmado su cita:
        
        📅 Fecha: {cita.fecha}
        ⏰ Hora: {cita.hora}
        📋 Motivo: {cita.motivo}
        """
        
        return cls.crear_notificacion(
            usuario=doctor,
            tipo='confirmacion_cita',
            titulo='Paciente Confirmó Cita',
            mensaje=mensaje_doctor,
            objeto_relacionado=cita
        )
    
    @classmethod
    def notificar_cita_cancelada(cls, cita, cancelado_por):
        """Notificar que una cita fue cancelada"""
        paciente = cita.paciente.usuario
        doctor = cita.doctor.usuario
        
        if cancelado_por == 'paciente':
            mensaje_doctor = f"""
            ❌ Cita Cancelada - Belkis-saúde
            
            Dr. {doctor.first_name},
            
            El paciente {paciente.first_name} {paciente.last_name} ha cancelado su cita:
            
            📅 Fecha: {cita.fecha}
            ⏰ Hora: {cita.hora}
            
            Este horario queda disponible para nuevas reservas.
            """
            
            cls.crear_notificacion(
                usuario=doctor,
                tipo='cancelacion_cita',
                titulo='Cita Cancelada por Paciente',
                mensaje=mensaje_doctor,
                objeto_relacionado=cita
            )
            
            # Notificar disponibilidad
            cls.notificar_disponibilidad_doctor(doctor, cita.fecha, cita.hora)
            
        else:  # cancelado por admin/doctor
            mensaje_paciente = f"""
            ❌ Cita Cancelada - Belkis-saúde
            
            Hola {paciente.first_name},
            
            Lamentamos informarte que tu cita ha sido cancelada:
            
            📅 Fecha: {cita.fecha}
            ⏰ Hora: {cita.hora}
            👨‍⚕️ Doctor: Dr. {doctor.first_name} {doctor.last_name}
            
            Por favor, contacta al consultorio para reagendar.
            """
            
            cls.crear_notificacion(
                usuario=paciente,
                tipo='cancelacion_cita',
                titulo='Cita Cancelada',
                mensaje=mensaje_paciente,
                objeto_relacionado=cita
            )
    
    @classmethod
    def notificar_disponibilidad_doctor(cls, doctor, fecha, hora):
        """Notificar que hay un horario disponible"""
        # Aquí podrías notificar a pacientes en lista de espera
        pass