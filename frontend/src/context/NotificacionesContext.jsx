import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '../services/auth';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { APP_NAME } from '../config/constants';

const NotificacionesContext = createContext();

export const useNotificaciones = () => {
  const context = useContext(NotificacionesContext);
  if (!context) {
    throw new Error('useNotificaciones debe usarse dentro de NotificacionesProvider');
  }
  return context;
};

export const NotificacionesProvider = ({ children }) => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);
  const { user } = useAuth();
  const { language, t } = useLanguage();

  // Función para traducir y procesar notificaciones
  const procesarNotificacion = (notif) => {
    const datosMsg = notif.mensaje ? notif.mensaje.split('|') : [];
    
    // Mapeo de títulos a traducciones y formato
    const traducciones = {
      'nueva_cita_creada': {
        titulo: t('notifications.appointmentCreated') || 'Nueva Cita Creada',
        template: (datos) => `Tu cita con ${datos[1]} el ${datos[2]} a las ${datos[3]} ha sido creada.`
      },
      'nueva_cita_para_doctor': {
        titulo: t('notifications.newAppointmentForDoctor') || 'Nueva Cita Agendada',
        template: (datos) => `Nueva cita del paciente ${datos[1]} el ${datos[2]} a las ${datos[3]}.`
      },
      'cita_confirmada_paciente': {
        titulo: t('notifications.appointmentConfirmed') || 'Cita Confirmada',
        template: (datos) => `Tu cita con ${datos[1]} el ${datos[2]} a las ${datos[3]} ha sido confirmada.`
      },
      'cita_confirmada_doctor': {
        titulo: t('notifications.patientConfirmedAppointment') || 'Paciente Confirmó Cita',
        template: (datos) => `El paciente ${datos[1]} confirmó su cita para ${datos[2]} a las ${datos[3]}.`
      },
      'cita_cancelada_por_paciente_paciente': {
        titulo: t('notifications.appointmentCancelled') || 'Cita Cancelada',
        template: (datos) => `Tu cita con ${datos[1]} del ${datos[2]} a las ${datos[3]} ha sido cancelada.`
      },
      'cita_cancelada_por_paciente_doctor': {
        titulo: t('notifications.patientCancelledAppointment') || 'Cita Cancelada por Paciente',
        template: (datos) => `El paciente ${datos[1]} canceló su cita del ${datos[2]} a las ${datos[3]}.`
      },
      'cita_cancelada_por_admin_paciente': {
        titulo: t('notifications.appointmentCancelledByAdmin') || 'Cita Cancelada',
        template: (datos) => `Tu cita con ${datos[1]} del ${datos[2]} a las ${datos[3]} ha sido cancelada.`
      },
      'cita_pospuesta_por_paciente_paciente': {
        titulo: t('notifications.appointmentPostponed') || 'Cita Reprogramada',
        template: (datos) => `Tu cita con ${datos[1]} ha sido reprogramada del ${datos[2]} a las ${datos[3]} al ${datos[4]} a las ${datos[5]}.`
      },
      'cita_pospuesta_por_paciente_doctor': {
        titulo: t('notifications.patientPostponedAppointment') || 'Cita Reprogramada por Paciente',
        template: (datos) => `El paciente ${datos[1]} reprogramó su cita del ${datos[2]} a las ${datos[3]} al ${datos[4]} a las ${datos[5]}.`
      },
      'cita_pospuesta_por_admin_paciente': {
        titulo: t('notifications.appointmentPostponedByAdmin') || 'Cita Reprogramada',
        template: (datos) => `Tu cita con ${datos[1]} ha sido reprogramada del ${datos[2]} a las ${datos[3]} al ${datos[4]} a las ${datos[5]}.`
      },
      'nuevo_usuario_registrado_admin': {
        titulo: t('notifications.newUserRegistered') || 'Nuevo Usuario Registrado',
        template: (datos) => `Se registró un nuevo ${datos[1]}: ${datos[0]}.`
      },
      'imagen_perfil_actualizada_admin': {
        titulo: t('notifications.profileImageUpdated') || 'Imagen de Perfil Actualizada',
        template: (datos) => `${datos[0]} (${datos[1]}) actualizó su foto de perfil.`
      },
      'horarios_actualizado_admin': {
        titulo: t('notifications.scheduleUpdated') || 'Horarios Actualizados',
        template: (datos) => `${datos[0]} (${datos[1]}) actualizó sus horarios.`
      },
      'horarios_creada_admin': {
        titulo: t('notifications.scheduleCreated') || 'Nuevo Horario Creado',
        template: (datos) => `Se creó un nuevo horario para ${datos[0]} (${datos[1]}).`
      },
      'especialidad_creada_admin': {
        titulo: t('notifications.specialtyCreated') || 'Nueva Especialidad Creada',
        template: (datos) => `Se creó la especialidad: ${datos[0]}`
      },
      'especialidad_actualizado_admin': {
        titulo: t('notifications.specialtyUpdated') || 'Especialidad Actualizada',
        template: (datos) => `Se actualizó la especialidad: ${datos[0]}`
      }
    };

    const config = traducciones[notif.titulo] || {
      titulo: notif.titulo,
      template: (datos) => notif.mensaje
    };

    return {
      ...notif,
      titulo_traducido: config.titulo,
      mensaje_traducido: config.template(datosMsg)
    };
  };

  // Cargar notificaciones iniciales
  const cargarNotificaciones = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await axiosInstance.get('notificaciones/');
      const data = Array.isArray(response.data) ? response.data : [];
      
      // Procesar notificaciones con traducción
      const notificacionesProcesadas = data.map(notif => procesarNotificacion(notif));
      setNotificaciones(notificacionesProcesadas);
      
      const noLeidasCount = notificacionesProcesadas.filter(n => !n.leida).length;
      setNoLeidas(noLeidasCount);
      
      // Actualizar el título del documento con el contador
      if (noLeidasCount > 0) {
       document.title = `(${noLeidasCount}) ${APP_NAME}`;
      } else {
       document.title = APP_NAME;
      }
      
    } catch (err) {
      console.error('Error cargando notificaciones:', err);
      setError('Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  }, [user, language]);

  // Configurar polling cada 30 segundos
  useEffect(() => {
    if (!user) {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
      return;
    }

    // Cargar inicial
    cargarNotificaciones();

    // Configurar polling
    const interval = setInterval(cargarNotificaciones, 30000); // 30 segundos
    setPollingInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user, cargarNotificaciones]);

  // Marcar una notificación como leída
  const marcarComoLeida = async (id) => {
    const notificacion = notificaciones.find(n => n.id === id);
    if (!notificacion || notificacion.leida) return;
    
    try {
      await axiosInstance.post(`notificaciones/${id}/marcar_leida/`);
      
      // Actualizar estado local
      setNotificaciones(prev =>
        prev.map(n =>
          n.id === id ? { ...n, leida: true } : n
        )
      );

      // Actualizar título del documento
      const noLeidasRestantes = notificaciones.filter(n => n.id !== id && !n.leida).length;
      if (noLeidasRestantes > 0) {
        document.title = `(${noLeidasRestantes}) ${APP_NAME}`;
      } else {
        document.title = APP_NAME;
      }

      setNoLeidas(prev => Math.max(0, prev - 1));
      
    } catch (err) {
      console.error('Error marcando notificación como leída:', err);
    }
  };

  // Marcar todas como leídas
  const marcarTodasLeidas = async () => {
    try {
      await axiosInstance.post('notificaciones/marcar_todas_leidas/');
      
      setNotificaciones(prev => 
        prev.map(n => ({ ...n, leida: true }))
      );
      setNoLeidas(0);
      
    } catch (err) {
      console.error('Error marcando todas como leídas:', err);
    }
  };

  // Eliminar una notificación
  const eliminarNotificacion = async (id) => {
    try {
      await axiosInstance.delete(`notificaciones/${id}/`);
      
      const notificacionEliminada = notificaciones.find(n => n.id === id);
      setNotificaciones(prev => prev.filter(n => n.id !== id));
      
      if (notificacionEliminada && !notificacionEliminada.leida) {
        setNoLeidas(prev => Math.max(0, prev - 1));
      }
      
    } catch (err) {
      console.error('Error eliminando notificación:', err);
    }
  };

  return (
    <NotificacionesContext.Provider value={{
      notificaciones,
      noLeidas,
      loading,
      error,
      cargarNotificaciones,
      marcarComoLeida,
      marcarTodasLeidas,
      eliminarNotificacion
    }}>
      {children}
    </NotificacionesContext.Provider>
  );
};