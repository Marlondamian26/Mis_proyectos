import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '../services/auth';
import { useAuth } from './AuthContext';
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
  const { user } = useAuth(); // Necesitas crear este contexto

  // Cargar notificaciones iniciales
  const cargarNotificaciones = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await axiosInstance.get('notificaciones/');
      const data = Array.isArray(response.data) ? response.data : [];
      setNotificaciones(data);
      
      const noLeidasCount = data.filter(n => !n.leida).length;
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
  }, [user]);

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
    try {
      await axiosInstance.post(`notificaciones/${id}/marcar_leida/`);
      
      // Actualizar estado local
      setNotificaciones(prev => 
        prev.map(n => 
          n.id === id ? { ...n, leida: true } : n
        )
      );
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