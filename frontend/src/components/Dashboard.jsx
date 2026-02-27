import React, { useEffect, useState } from 'react'
import axiosInstance from '../services/auth'
import { useNavigate } from 'react-router-dom'
import { useNotificaciones } from '../context/NotificacionesContext';

function Dashboard() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { noLeidas } = useNotificaciones();  // ⬅️ ESTO YA LO TENÍAS

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('access_token')
      
      // Verificar si hay token
      if (!token) {
        console.log('No hay token, redirigiendo a login')
        navigate('/login')
        return
      }

      try {
        console.log('Obteniendo datos del usuario...')
        const response = await axiosInstance.get('usuario-actual/')
        console.log('Respuesta del servidor:', response.data)
        
        // Verificar que response.data existe y tiene los campos esperados
        if (response.data && response.data.username) {
          setUser(response.data)
          setError('')
        } else {
          console.error('Respuesta inválida del servidor:', response.data)
          setError('Error al cargar los datos del usuario')
        }
      } catch (err) {
        console.error('Error detallado:', err)
        
        // Manejar diferentes tipos de error
        if (err.response) {
          // El servidor respondió con un error
          console.error('Respuesta de error:', err.response.data)
          console.error('Status:', err.response.status)
          
          if (err.response.status === 401) {
            // Token inválido o expirado
            console.log('Token inválido, eliminando...')
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            setError('Sesión expirada. Por favor inicia sesión nuevamente.')
            setTimeout(() => navigate('/login'), 2000)
          } else {
            setError(`Error del servidor: ${err.response.status}`)
          }
        } else if (err.request) {
          // No se recibió respuesta
          console.error('No hubo respuesta del servidor')
          setError('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.')
        } else {
          // Error en la configuración de la petición
          console.error('Error en la petición:', err.message)
          setError('Error al conectar con el servidor')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [navigate])

  const handleLogout = () => {
    console.log('Cerrando sesión...')
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
    navigate('/login')
  }

  const handleNavigation = (path) => {
    console.log(`Navegando a: ${path}`)
    navigate(path)
  }

  // Mostrar pantalla de carga
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p style={styles.loadingText}>Cargando tu información...</p>
        <p style={styles.loadingSubtext}>Por favor espera</p>
      </div>
    )
  }

  // Mostrar error si existe
  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>⚠️</div>
        <h2 style={styles.errorTitle}>Error</h2>
        <p style={styles.errorMessage}>{error}</p>
        <button 
          onClick={() => navigate('/login')} 
          style={styles.errorButton}
        >
          Ir al Login
        </button>
      </div>
    )
  }

  // Si no hay usuario pero tampoco error (caso raro)
  if (!user) {
    return (
      <div style={styles.errorContainer}>
        <p>No se pudo cargar la información del usuario</p>
        <button onClick={() => navigate('/login')} style={styles.errorButton}>
          Volver al Login
        </button>
      </div>
    )
  }

  // Renderizar el dashboard normalmente
  return (
    <div style={styles.container}>
      {/* Header con información del usuario */}
      <div style={styles.header}>
        <div style={styles.welcomeSection}>
          <h1 style={styles.welcomeTitle}>
            ¡Bienvenido{user?.first_name ? `, ${user.first_name}` : ''}!
          </h1>
          <p style={styles.userRole}>
            {user?.rol === 'admin' && '⚙️ Administrador'}
            {user?.rol === 'doctor' && '👨‍⚕️ Médico'}
            {user?.rol === 'nurse' && '👩‍⚕️ Enfermería'}
            {user?.rol === 'patient' && '🩺 Paciente'}
          </p>
          {/* ⬇️ NOTIFICACIONES AÑADIDAS AQUÍ (OPCIÓN 1) ⬇️ */}
          {noLeidas > 0 && (
            <div style={styles.notificacionBanner}>
              <span style={styles.notificacionIcon}>🔔</span>
              <span style={styles.notificacionTexto}>
                Tienes <strong>{noLeidas}</strong> notificación{noLeidas !== 1 ? 'es' : ''} sin leer
              </span>
            </div>
          )}
        </div>
        <button onClick={handleLogout} style={styles.logoutButton}>
          <span style={styles.logoutIcon}>🚪</span>
          Cerrar Sesión
        </button>
      </div>
      
      {/* Contenido principal */}
      <div style={styles.content}>
        {/* Tarjeta de información del usuario */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>
            <span style={styles.cardIcon}>📋</span>
            Información Personal
          </h3>
          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Usuario:</span>
              <span style={styles.infoValue}>{user?.username || 'No disponible'}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Nombre:</span>
              <span style={styles.infoValue}>
                {user?.first_name || ''} {user?.last_name || ''}
              </span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Email:</span>
              <span style={styles.infoValue}>{user?.email || 'No disponible'}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Teléfono:</span>
              <span style={styles.infoValue}>{user?.telefono || 'No disponible'}</span>
            </div>
          </div>
        </div>

        {/* Menú de navegación */}
        <div style={styles.menuCard}>
          <h3 style={styles.cardTitle}>
            <span style={styles.cardIcon}>📌</span>
            Menú Principal
          </h3>
          <div style={styles.menuGrid}>
            {/* Mis Citas - Visible para todos */}
            <div 
              style={styles.menuItem} 
              onClick={() => handleNavigation('/citas')}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && handleNavigation('/citas')}
            >
              <span style={styles.menuIcon}>📅</span>
              <span style={styles.menuLabel}>Mis Citas</span>
              <span style={styles.menuDescription}>Ver y gestionar tus citas</span>
            </div>

            {/* Doctores - Visible para todos */}
            <div 
              style={styles.menuItem} 
              onClick={() => handleNavigation('/doctores')}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && handleNavigation('/doctores')}
            >
              <span style={styles.menuIcon}>👨‍⚕️</span>
              <span style={styles.menuLabel}>Doctores</span>
              <span style={styles.menuDescription}>Ver especialistas disponibles</span>
            </div>

            {/* Mi Perfil - Visible para todos */}
            <div 
              style={styles.menuItem} 
              onClick={() => handleNavigation('/perfil')}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && handleNavigation('/perfil')}
            >
              <span style={styles.menuIcon}>👤</span>
              <span style={styles.menuLabel}>Mi Perfil</span>
              <span style={styles.menuDescription}>Editar tu información personal</span>
            </div>

            {/* Panel Admin - Solo visible para administradores */}
            {user?.rol === 'admin' && (
              <div 
                style={{...styles.menuItem, ...styles.adminMenuItem}} 
                onClick={() => handleNavigation('/admin')}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => e.key === 'Enter' && handleNavigation('/admin')}
              >
                <span style={styles.menuIcon}>⚙️</span>
                <span style={styles.menuLabel}>Panel Admin</span>
                <span style={styles.menuDescription}>Gestionar el sistema</span>
              </div>
            )}
          </div>
        </div>

        {/* ⬇️ NOTIFICACIONES AÑADIDAS AQUÍ (OPCIÓN 2 - dentro de la tarjeta de info) ⬇️ */}
        {noLeidas > 0 && (
          <div style={styles.notificacionCard}>
            <div style={styles.notificacionCardHeader}>
              <span style={styles.notificacionCardIcon}>🔔</span>
              <h3 style={styles.notificacionCardTitle}>Notificaciones pendientes</h3>
            </div>
            <p style={styles.notificacionCardText}>
              Tienes <strong>{noLeidas}</strong> notificación{noLeidas !== 1 ? 'es' : ''} sin leer.
              Haz clic en la campana 🔔 para verlas.
            </p>
            <div style={styles.notificacionCardActions}>
              <button 
                onClick={() => {
                  // Opcional: abrir el dropdown de notificaciones
                  // Esto requeriría una referencia al componente NotificacionesCampana
                  console.log('Abrir notificaciones');
                }}
                style={styles.notificacionCardButton}
              >
                Ver notificaciones
              </button>
            </div>
          </div>
        )}

        {/* Información adicional según el rol */}
        {user?.rol === 'patient' && (
          <div style={styles.infoCard}>
            <h3 style={styles.cardTitle}>
              <span style={styles.cardIcon}>💡</span>
              Recordatorios
            </h3>
            <p style={styles.infoText}>
              Puedes reservar citas con nuestros especialistas desde la sección "Doctores" o "Mis Citas".
            </p>
          </div>
        )}

        {user?.rol === 'nurse' && (
          <div style={styles.infoCard}>
            <h3 style={styles.cardTitle}>
              <span style={styles.cardIcon}>👩‍⚕️</span>
              Panel de Enfermería
            </h3>
            <div style={styles.adminQuickLinks}>
              <button 
                onClick={() => handleNavigation('/enfermeria')}
                style={styles.quickLink}
              >
                👩‍⚕️ Ir a Panel de Enfermería
              </button>
              <button 
                onClick={() => handleNavigation('/enfermeria?tab=pacientes')}
                style={styles.quickLink}
              >
                📋 Pacientes del Día
              </button>
              <button 
                onClick={() => handleNavigation('/enfermeria?tab=procedimientos')}
                style={styles.quickLink}
              >
                💉 Procedimientos Pendientes
              </button>
            </div>
            <p style={styles.infoText}>
              Gestiona pacientes, registra signos vitales y realiza procedimientos.
            </p>
          </div>
        )}

        {user?.rol === 'admin' && (
          <div style={styles.infoCard}>
            <h3 style={styles.cardTitle}>
              <span style={styles.cardIcon}>📊</span>
              Accesos Rápidos de Administrador
            </h3>
            <div style={styles.adminQuickLinks}>
              <button 
                onClick={() => handleNavigation('/admin?tab=usuarios')}
                style={styles.quickLink}
              >
                👥 Gestionar Usuarios
              </button>
              <button 
                onClick={() => handleNavigation('/admin?tab=doctores')}
                style={styles.quickLink}
              >
                👨‍⚕️ Gestionar Doctores
              </button>
              <button 
                onClick={() => handleNavigation('/admin?tab=enfermeras')}
                style={styles.quickLink}
              >
                👩‍⚕️ Gestionar Enfermeras
              </button>
              <button 
                onClick={() => handleNavigation('/admin?tab=citas')}
                style={styles.quickLink}
              >
                📅 Ver Todas las Citas
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Estilos 
const styles = {
  // ============================================
  // CONTENEDORES PRINCIPALES
  // ============================================
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: 'var(--bg-primary)',
    minHeight: '100vh',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '25px'
  },

  // ============================================
  // LOADING (PANTALLA DE CARGA)
  // ============================================
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-primary)'
  },
  loadingSpinner: {
    fontSize: '48px',
    color: 'var(--color-patient)',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px'
  },
  loadingText: {
    fontSize: '18px',
    color: 'var(--text-primary)',
    marginBottom: '5px'
  },
  loadingSubtext: {
    fontSize: '14px',
    color: 'var(--text-muted)'
  },

  // ============================================
  // ERROR (PANTALLA DE ERROR)
  // ============================================
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-primary)',
    padding: '20px',
    textAlign: 'center'
  },
  errorIcon: {
    fontSize: '48px',
    color: '#e74c3c',
    marginBottom: '20px'
  },
  errorTitle: {
    fontSize: '24px',
    color: 'var(--text-primary)',
    marginBottom: '10px'
  },
  errorMessage: {
    fontSize: '16px',
    color: 'var(--text-secondary)',
    marginBottom: '30px',
    maxWidth: '400px'
  },
  errorButton: {
    backgroundColor: 'var(--color-patient)',
    color: 'white',
    padding: '12px 30px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    marginBottom: '10px'
  },
  retryButton: {
    backgroundColor: 'var(--color-patient)',
    color: 'white',
    padding: '12px 30px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    marginBottom: '10px'
  },

  // ============================================
  // HEADER (CABECERA DEL DASHBOARD)
  // ============================================
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    backgroundColor: 'var(--bg-secondary)',
    padding: '25px',
    borderRadius: '15px',
    boxShadow: 'var(--box-shadow)',
    border: '1px solid var(--border-color)'
  },
  welcomeSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  welcomeTitle: {
    fontSize: '24px',
    color: 'var(--text-primary)',
    margin: 0
  },
  userRole: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    color: 'white',
    padding: '12px 25px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  logoutIcon: {
    fontSize: '18px'
  },

  // ============================================
  // TARJETAS (CARD) GENÉRICAS
  // ============================================
  card: {
    backgroundColor: 'var(--bg-secondary)',
    padding: '25px',
    borderRadius: '15px',
    boxShadow: 'var(--box-shadow)',
    border: '1px solid var(--border-color)'
  },
  menuCard: {
    backgroundColor: 'var(--bg-secondary)',
    padding: '25px',
    borderRadius: '15px',
    boxShadow: 'var(--box-shadow)',
    border: '1px solid var(--border-color)'
  },
  infoCard: {
    backgroundColor: 'var(--bg-tertiary)',
    padding: '25px',
    borderRadius: '15px',
    border: '1px solid var(--border-color)'
  },
  cardTitle: {
    fontSize: '20px',
    color: 'var(--text-primary)',
    margin: '0 0 20px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  cardIcon: {
    fontSize: '24px',
    color: 'var(--color-patient)'
  },

  // ============================================
  // INFORMACIÓN DE USUARIO (GRID)
  // ============================================
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px'
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  infoLabel: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  infoValue: {
    fontSize: '16px',
    color: 'var(--text-primary)',
    fontWeight: '500'
  },

  // ============================================
  // MENÚ DE NAVEGACIÓN (GRID DE OPCIONES)
  // ============================================
  menuGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px'
  },
  menuItem: {
    backgroundColor: 'var(--bg-tertiary)',
    padding: '20px',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    color: 'var(--text-primary)',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: 'var(--box-shadow-hover)'
    }
  },
  adminMenuItem: {
    borderLeft: '4px solid var(--color-admin)'
  },
  menuIcon: {
    fontSize: '32px',
    color: 'var(--color-patient)',
    marginBottom: '5px'
  },
  menuLabel: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--text-primary)'
  },
  menuDescription: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    lineHeight: '1.4'
  },

  // ============================================
  // ENLACES RÁPIDOS (ADMIN)
  // ============================================
  adminQuickLinks: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
    marginTop: '15px'
  },
  quickLink: {
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    padding: '12px 20px',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s',
    ':hover': {
      backgroundColor: 'var(--color-admin)',
      color: 'white',
      borderColor: 'var(--color-admin)'
    }
  },

  // ============================================
  // TEXTO INFORMATIVO
  // ============================================
  infoText: {
    fontSize: '15px',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    margin: 0
  },

  // ============================================
  // NOTIFICACIONES (BANNER)
  // ============================================
  notificacionBanner: {
    backgroundColor: 'var(--color-admin)',
    color: 'white',
    padding: '8px 15px',
    borderRadius: '20px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '10px',
    fontSize: '14px'
  },
  notificacionIcon: {
    fontSize: '16px'
  },
  notificacionTexto: {
    color: 'white'
  },

  // ============================================
  // NOTIFICACIONES (TARJETA)
  // ============================================
  notificacionCard: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--color-admin)',
    borderRadius: '10px',
    padding: '15px',
    marginTop: '10px'
  },
  notificacionCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px'
  },
  notificacionCardIcon: {
    fontSize: '24px'
  },
  notificacionCardTitle: {
    margin: 0,
    fontSize: '16px',
    color: 'var(--text-primary)'
  },
  notificacionCardText: {
    margin: '0 0 15px 0',
    fontSize: '14px',
    color: 'var(--text-secondary)'
  },
  notificacionCardActions: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  notificacionCardButton: {
    backgroundColor: 'var(--color-admin)',
    color: 'white',
    padding: '8px 15px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'all 0.3s',
    ':hover': {
      backgroundColor: 'var(--color-admin-soft)',
      transform: 'translateY(-2px)'
    }
  }
}

// Añadir animación de spin para el loader
const styleSheet = document.createElement("style")
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`
document.head.appendChild(styleSheet)

export default Dashboard