from django.core.mail import send_mail
from django.utils import timezone
from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from twilio.rest import Client
import requests
from .models import Notificacion
from usuarios.models import Usuario

class ServicioNotificaciones:
    
    @staticmethod
    def enviar_email(destinatario, asunto, mensaje):
        """Enviar notificación por email"""
        if not settings.EMAIL_HOST_USER:
            return False, "Email no configurado"
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
        if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN or not settings.TWILIO_WHATSAPP_NUMBER:
            return False, "WhatsApp no configurado"
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
    def notificar_cita_creada(cls, cita, creado_por_admin=False):
        """Notificar al paciente y al doctor cuando se crea una cita"""
        paciente = cita.paciente.usuario
        doctor = cita.doctor.usuario

        # Mensaje para el paciente
        titulo_paciente = 'nueva_cita_creada'
        mensaje_paciente = f"{paciente.first_name}|{doctor.first_name} {doctor.last_name}|{cita.fecha}|{cita.hora}|{cita.motivo}"

        # Mensaje para el doctor
        titulo_doctor = 'nueva_cita_para_doctor'
        mensaje_doctor = f"{doctor.first_name}|{paciente.first_name} {paciente.last_name}|{cita.fecha}|{cita.hora}|{cita.motivo}"

        cls.crear_notificacion(
            usuario=doctor,
            tipo='nueva_cita',
            titulo=titulo_doctor,
            mensaje=mensaje_doctor,
            objeto_relacionado=cita
        )

        return cls.crear_notificacion(
            usuario=paciente,
            tipo='nueva_cita',
            titulo=titulo_paciente,
            mensaje=mensaje_paciente,
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
        
        # Mensaje para el paciente
        titulo_paciente = 'cita_confirmada_paciente'
        mensaje_paciente = f"{paciente.first_name}|{doctor.first_name} {doctor.last_name}|{cita.fecha}|{cita.hora}"
        
        # Notificar al paciente
        cls.crear_notificacion(
            usuario=paciente,
            tipo='confirmacion_cita',
            titulo=titulo_paciente,
            mensaje=mensaje_paciente,
            objeto_relacionado=cita
        )
        
        # Mensaje para el doctor
        titulo_doctor = 'cita_confirmada_doctor'
        mensaje_doctor = f"{doctor.first_name}|{paciente.first_name} {paciente.last_name}|{cita.fecha}|{cita.hora}|{cita.motivo}"
        
        return cls.crear_notificacion(
            usuario=doctor,
            tipo='confirmacion_cita',
            titulo=titulo_doctor,
            mensaje=mensaje_doctor,
            objeto_relacionado=cita
        )
    
    @classmethod
    def notificar_cita_cancelada(cls, cita, cancelado_por, cancelado_por_nombre=None):
        """Notificar que una cita fue cancelada"""
        paciente = cita.paciente.usuario
        doctor = cita.doctor.usuario
        
        if cancelado_por == 'paciente':
            # Mensaje para el doctor
            titulo_doctor = 'cita_cancelada_por_paciente_doctor'
            mensaje_doctor = f"{doctor.first_name}|{paciente.first_name} {paciente.last_name}|{cita.fecha}|{cita.hora}"
            
            cls.crear_notificacion(
                usuario=doctor,
                tipo='cancelacion_cita',
                titulo=titulo_doctor,
                mensaje=mensaje_doctor,
                objeto_relacionado=cita
            )

            # Mensaje para el paciente
            titulo_paciente = 'cita_cancelada_por_paciente_paciente'
            mensaje_paciente = f"{paciente.first_name}|{doctor.first_name} {doctor.last_name}|{cita.fecha}|{cita.hora}"
            
            cls.crear_notificacion(
                usuario=paciente,
                tipo='cancelacion_cita',
                titulo=titulo_paciente,
                mensaje=mensaje_paciente,
                objeto_relacionado=cita
            )
            
            # Notificar disponibilidad
            cls.notificar_disponibilidad_doctor(doctor, cita.fecha, cita.hora)
            
        else:  # cancelado por admin/doctor
            # Mensaje para el paciente (admin no se menciona por seguridad)
            titulo_paciente = 'cita_cancelada_por_admin_paciente'
            mensaje_paciente = f"{paciente.first_name}|{doctor.first_name} {doctor.last_name}|{cita.fecha}|{cita.hora}"
            
            cls.crear_notificacion(
                usuario=paciente,
                tipo='cancelacion_cita',
                titulo=titulo_paciente,
                mensaje=mensaje_paciente,
                objeto_relacionado=cita
            )

    @classmethod
    def notificar_cita_pospuesta(cls, cita, pospuesta_por, nueva_fecha, nueva_hora, pospuesta_por_nombre=None):
        """Notificar que una cita fue pospuesta"""
        paciente = cita.paciente.usuario
        doctor = cita.doctor.usuario
        
        if pospuesta_por == 'paciente':
            # Mensaje para el doctor
            titulo_doctor = 'cita_pospuesta_por_paciente_doctor'
            mensaje_doctor = f"{doctor.first_name}|{paciente.first_name} {paciente.last_name}|{cita.fecha}|{cita.hora}|{nueva_fecha}|{nueva_hora}"
            
            cls.crear_notificacion(
                usuario=doctor,
                tipo='modificacion_cita',
                titulo=titulo_doctor,
                mensaje=mensaje_doctor,
                objeto_relacionado=cita
            )

            # Mensaje para el paciente
            titulo_paciente = 'cita_pospuesta_por_paciente_paciente'
            mensaje_paciente = f"{paciente.first_name}|{doctor.first_name} {doctor.last_name}|{cita.fecha}|{cita.hora}|{nueva_fecha}|{nueva_hora}"
            
            cls.crear_notificacion(
                usuario=paciente,
                tipo='modificacion_cita',
                titulo=titulo_paciente,
                mensaje=mensaje_paciente,
                objeto_relacionado=cita
            )
        else:  # pospuesta por admin/doctor
            # Mensaje para el paciente (admin no se menciona)
            titulo_paciente = 'cita_pospuesta_por_admin_paciente'
            mensaje_paciente = f"{paciente.first_name}|{doctor.first_name} {doctor.last_name}|{cita.fecha}|{cita.hora}|{nueva_fecha}|{nueva_hora}"
            
            cls.crear_notificacion(
                usuario=paciente,
                tipo='modificacion_cita',
                titulo=titulo_paciente,
                mensaje=mensaje_paciente,
                objeto_relacionado=cita
            )
    
    @classmethod
    def notificar_disponibilidad_doctor(cls, doctor, fecha, hora):
        """Notificar que hay un horario disponible"""
        # Aquí podrías notificar a pacientes en lista de espera
        pass
    
    @classmethod
    def notificar_usuario_registrado(cls, usuario_nuevo, registrado_por_admin=None):
        """Notificar a administradores cuando se registra un nuevo usuario"""
        if usuario_nuevo.rol == 'admin':
            # Notificar a otros administradores
            otros_admins = Usuario.objects.filter(rol='admin').exclude(id=usuario_nuevo.id)
            
            titulo = 'nuevo_usuario_registrado_admin'
            mensaje = f"{usuario_nuevo.first_name} {usuario_nuevo.last_name}|{usuario_nuevo.get_rol_display()}|{usuario_nuevo.email}"
            
            for admin in otros_admins:
                cls.crear_notificacion(
                    usuario=admin,
                    tipo='nuevo_usuario',
                    titulo=titulo,
                    mensaje=mensaje
                )
    
    @classmethod
    def notificar_imagen_perfil_actualizada(cls, usuario):
        """Notificar a administradores cuando se actualiza imagen de perfil"""
        if usuario.rol in ['doctor', 'nurse']:
            # Notificar a todos los administradores
            admins = Usuario.objects.filter(rol='admin')
            
            titulo = 'imagen_perfil_actualizada_admin'
            rol_display = 'doctor' if usuario.rol == 'doctor' else 'enfermera'
            mensaje = f"{usuario.first_name} {usuario.last_name}|{rol_display}"
            
            for admin in admins:
                cls.crear_notificacion(
                    usuario=admin,
                    tipo='cambio_imagen',
                    titulo=titulo,
                    mensaje=mensaje
                )
    
    @classmethod
    def notificar_cambios_horarios(cls, usuario, accion='actualizado'):
        """Notificar a administradores cuando se cambian horarios"""
        if usuario.rol in ['doctor', 'nurse']:
            # Notificar a todos los administradores
            admins = Usuario.objects.filter(rol='admin')
            
            titulo = f'horarios_{accion}_admin'
            rol_display = 'doctor' if usuario.rol == 'doctor' else 'enfermera'
            mensaje = f"{usuario.first_name} {usuario.last_name}|{rol_display}"
            
            for admin in admins:
                cls.crear_notificacion(
                    usuario=admin,
                    tipo='cambio_horarios',
                    titulo=titulo,
                    mensaje=mensaje
                )
    
    @classmethod
    def notificar_cambios_especialidades(cls, accion='creada', especialidad_nombre=None):
        """Notificar a administradores cuando se cambian especialidades"""
        admins = Usuario.objects.filter(rol='admin')
        
        titulo = f'especialidad_{accion}_admin'
        mensaje = especialidad_nombre or 'Cambio en especialidades'
        
        for admin in admins:
            cls.crear_notificacion(
                usuario=admin,
                tipo='cambio_especialidades',
                titulo=titulo,
                mensaje=mensaje
            )