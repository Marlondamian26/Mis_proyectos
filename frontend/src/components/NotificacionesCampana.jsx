import React, { useState, useRef, useEffect } from 'react';
import { useNotificaciones } from '../context/NotificacionesContext';
import { FaBell, FaCheck, FaTrash, FaClock } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const NotificacionesCampana = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { notificaciones, noLeidas, marcarComoLeida, marcarTodasLeidas, eliminarNotificacion } = useNotificaciones();

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIconoTipo = (tipo) => {
    const iconos = {
      recordatorio_cita: '🔔',
      confirmacion_cita: '✅',
      cancelacion_cita: '❌',
      nueva_cita: '📅',
      modificacion_cita: '✏️',
    };
    return iconos[tipo] || '📋';
  };

  return (
    <div style={styles.container} ref={dropdownRef}>
      {/* Botón circular con campana */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        style={styles.bellButton}
        aria-label="Notificaciones"
      >
        <FaBell style={styles.bellIcon} />
        {noLeidas > 0 && (
          <span style={styles.badge}>
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>

      {/* Dropdown de notificaciones */}
      {isOpen && (
        <div style={styles.dropdown}>
          <div style={styles.dropdownHeader}>
            <h3 style={styles.dropdownTitle}>Notificaciones</h3>
            {notificaciones.length > 0 && (
              <button 
                onClick={marcarTodasLeidas} 
                style={styles.markAllButton}
                title="Marcar todas como leídas"
              >
                <FaCheck /> Marcar todas
              </button>
            )}
          </div>

          <div style={styles.notificacionesList}>
            {notificaciones.length === 0 ? (
              <div style={styles.emptyState}>
                <p>No hay notificaciones</p>
              </div>
            ) : (
              notificaciones.slice(0, 10).map(notif => (
                <div 
                  key={notif.id} 
                  style={{
                    ...styles.notificacionItem,
                    ...(!notif.leida ? styles.noLeida : {})
                  }}
                >
                  <div style={styles.notificacionIcone}>
                    <span style={{ fontSize: '20px' }}>{getIconoTipo(notif.tipo)}</span>
                  </div>
                  
                  <div style={styles.notificacionContent}>
                    <div style={styles.notificacionHeader}>
                      <h4 style={styles.notificacionTitulo}>{notif.titulo}</h4>
                      <span style={styles.notificacionTiempo}>
                        <FaClock style={styles.clockIcon} />
                        {formatDistanceToNow(new Date(notif.fecha_creacion), { 
                          addSuffix: true,
                          locale: es 
                        })}
                      </span>
                    </div>
                    <p style={styles.notificacionMensaje}>{notif.mensaje}</p>
                    
                    <div style={styles.notificacionAcciones}>
                      {!notif.leida && (
                        <button 
                          onClick={() => marcarComoLeida(notif.id)}
                          style={styles.actionButton}
                          title="Marcar como leída"
                        >
                          <FaCheck />
                        </button>
                      )}
                      <button 
                        onClick={() => eliminarNotificacion(notif.id)}
                        style={{...styles.actionButton, ...styles.deleteButton}}
                        title="Eliminar"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notificaciones.length > 10 && (
            <div style={styles.dropdownFooter}>
              <button style={styles.verTodasButton}>
                Ver todas ({notificaciones.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    position: 'relative',
    display: 'inline-block',
  },
  bellButton: {
    position: 'relative',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '50%',
    width: '55px',
    height: '55px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'var(--text-primary)',
    transition: 'all 0.3s ease',
    boxShadow: 'var(--box-shadow)',
    ':hover': {
      transform: 'scale(1.05)',
      boxShadow: 'var(--box-shadow-hover)',
      backgroundColor: 'var(--bg-tertiary)',
    },
    ':active': {
      transform: 'scale(0.95)',
    },
  },
  bellIcon: {
    fontSize: '20px',
    color: 'var(--color-admin)',
  },
  badge: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    background: 'var(--color-admin)',
    color: 'white',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    border: '2px solid var(--bg-primary)',
  },
  dropdown: {
    position: 'absolute',
    top: '55px',
    right: '0',
    width: '350px',
    maxHeight: '500px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    boxShadow: 'var(--box-shadow-hover)',
    zIndex: 1000,
    overflow: 'hidden',
  },
  dropdownHeader: {
    padding: '15px',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownTitle: {
    margin: 0,
    fontSize: '16px',
    color: 'var(--text-primary)',
  },
  markAllButton: {
    background: 'none',
    border: '1px solid var(--color-admin)',
    borderRadius: '5px',
    padding: '5px 10px',
    fontSize: '12px',
    color: 'var(--color-admin)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    transition: 'all 0.3s',
    ':hover': {
      background: 'var(--color-admin)',
      color: 'white',
    },
  },
  notificacionesList: {
    maxHeight: '400px',
    overflowY: 'auto',
  },
  emptyState: {
    padding: '40px',
    textAlign: 'center',
    color: 'var(--text-muted)',
  },
  notificacionItem: {
    padding: '15px',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    gap: '15px',
    transition: 'background 0.3s',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: 'var(--bg-tertiary)',
    },
  },
  noLeida: {
    background: 'var(--bg-tertiary)',
    borderLeft: `3px solid var(--color-admin)`,
  },
  notificacionIcone: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'var(--bg-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificacionContent: {
    flex: 1,
  },
  notificacionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '5px',
  },
  notificacionTitulo: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  notificacionTiempo: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
  },
  clockIcon: {
    fontSize: '10px',
  },
  notificacionMensaje: {
    margin: 0,
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
    marginBottom: '10px',
    whiteSpace: 'pre-line',
  },
  notificacionAcciones: {
    display: 'flex',
    gap: '5px',
    justifyContent: 'flex-end',
  },
  actionButton: {
    background: 'none',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    padding: '4px 8px',
    fontSize: '11px',
    cursor: 'pointer',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    transition: 'all 0.3s',
    ':hover': {
      backgroundColor: 'var(--bg-primary)',
    },
  },
  deleteButton: {
    color: '#e74c3c',
    borderColor: '#e74c3c',
    ':hover': {
      backgroundColor: '#e74c3c',
      color: 'white',
    },
  },
  dropdownFooter: {
    padding: '10px',
    borderTop: '1px solid var(--border-color)',
    textAlign: 'center',
  },
  verTodasButton: {
    background: 'none',
    border: 'none',
    color: 'var(--color-admin)',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    ':hover': {
      textDecoration: 'underline',
    },
  },
};

export default NotificacionesCampana;