import React, { useEffect, useState } from 'react'
import axiosInstance from '../services/auth'
import { useNavigate } from 'react-router-dom'
import { 
  FaUser, FaEnvelope, FaPhone, FaAllergies, FaTint, 
  FaUserMd, FaHistory, FaEdit, FaKey, FaSave, FaTimes,
  FaBirthdayCake, FaVenusMars, FaAddressCard, FaHeart,
  FaExclamationTriangle, FaCheckCircle, FaSpinner
} from 'react-icons/fa'

function Perfil() {
  const [user, setUser] = useState(null)
  const [paciente, setPaciente] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState('Cargando perfil...')
  const [editMode, setEditMode] = useState(false)
  const [changePasswordMode, setChangePasswordMode] = useState(false)
  const [historialCitas, setHistorialCitas] = useState([])
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' })
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  // Estados para edición
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    telefono: '',
    alergias: '',
    grupo_sanguineo: '',
    contacto_emergencia: '',
    telefono_emergencia: ''
  })

  // Estado para cambio de contraseña
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  })

  // Estado para validación de contraseña
  const [passwordErrors, setPasswordErrors] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  })

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    setLoading(true)
    setLoadingMessage('Cargando tu información...')
    
    try {
      // Verificar token primero
      const token = localStorage.getItem('access_token')
      if (!token) {
        console.log('No hay token, redirigiendo a login')
        navigate('/login')
        return
      }

      // Obtener usuario actual
      setLoadingMessage('Obteniendo datos del usuario...')
      const userResponse = await axiosInstance.get('usuario-actual/')
      
      if (!userResponse.data) {
        throw new Error('No se recibieron datos del usuario')
      }

      console.log('Usuario cargado:', userResponse.data)
      setUser(userResponse.data)
      
      setEditForm({
        first_name: userResponse.data.first_name || '',
        last_name: userResponse.data.last_name || '',
        email: userResponse.data.email || '',
        telefono: userResponse.data.telefono || '',
        alergias: '',
        grupo_sanguineo: '',
        contacto_emergencia: '',
        telefono_emergencia: ''
      })

      // Si es paciente, obtener su perfil y citas
      if (userResponse.data.rol === 'patient') {
        setLoadingMessage('Cargando información médica...')
        
        // Obtener pacientes
        const pacientesResponse = await axiosInstance.get('pacientes/')
        const pacientesData = Array.isArray(pacientesResponse.data) ? pacientesResponse.data : []
        const miPaciente = pacientesData.find(p => p.usuario?.id === userResponse.data.id)
        
        if (miPaciente) {
          console.log('Perfil de paciente cargado:', miPaciente)
          setPaciente(miPaciente)
          setEditForm(prev => ({
            ...prev,
            alergias: miPaciente.alergias || '',
            grupo_sanguineo: miPaciente.grupo_sanguineo || '',
            contacto_emergencia: miPaciente.contacto_emergencia || '',
            telefono_emergencia: miPaciente.telefono_emergencia || ''
          }))
        }

        // Obtener historial de citas
        setLoadingMessage('Cargando historial de citas...')
        const citasResponse = await axiosInstance.get('citas/')
        const citasData = Array.isArray(citasResponse.data) ? citasResponse.data : []
        
        const citasCompletadas = citasData.filter(c => 
          c.estado === 'completada' || c.estado === 'cancelada' || c.estado === 'no_asistio'
        )
        
        console.log(`Historial cargado: ${citasCompletadas.length} citas`)
        setHistorialCitas(citasCompletadas)
      }
    } catch (error) {
      console.error('Error detallado cargando perfil:', error)
      
      if (error.response) {
        if (error.response.status === 401) {
          mostrarMensaje('Sesión expirada. Por favor inicia sesión nuevamente.', 'error')
          setTimeout(() => navigate('/login'), 2000)
        } else {
          mostrarMensaje(`Error del servidor: ${error.response.status}`, 'error')
        }
      } else if (error.request) {
        mostrarMensaje('No se pudo conectar con el servidor', 'error')
      } else {
        mostrarMensaje('Error al cargar el perfil: ' + error.message, 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Limpiar error del campo
    setPasswordErrors(prev => ({
      ...prev,
      [name]: ''
    }))
  }

  const validatePasswordForm = () => {
    const errors = {}
    
    if (!passwordForm.old_password) {
      errors.old_password = 'La contraseña actual es requerida'
    }
    
    if (!passwordForm.new_password) {
      errors.new_password = 'La nueva contraseña es requerida'
    } else if (passwordForm.new_password.length < 4) {
      errors.new_password = 'La contraseña debe tener al menos 4 caracteres'
    }
    
    if (!passwordForm.confirm_password) {
      errors.confirm_password = 'Confirma tu nueva contraseña'
    } else if (passwordForm.new_password !== passwordForm.confirm_password) {
      errors.confirm_password = 'Las contraseñas no coinciden'
    }
    
    setPasswordErrors(errors)
    return Object.keys(errors).length === 0
  }

  const guardarPerfil = async () => {
    setSaving(true)
    
    try {
      // Actualizar usuario
      await axiosInstance.patch(`usuarios/${user.id}/`, {
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        email: editForm.email,
        telefono: editForm.telefono
      })

      // Si es paciente, actualizar su perfil
      if (user.rol === 'patient' && paciente) {
        await axiosInstance.patch(`pacientes/${paciente.id}/`, {
          alergias: editForm.alergias,
          grupo_sanguineo: editForm.grupo_sanguineo,
          contacto_emergencia: editForm.contacto_emergencia,
          telefono_emergencia: editForm.telefono_emergencia
        })
      }

      mostrarMensaje('✅ Perfil actualizado correctamente', 'success')
      setEditMode(false)
      await fetchUserData() // Recargar datos
    } catch (error) {
      console.error('Error actualizando perfil:', error)
      
      if (error.response?.data) {
        const errors = Object.entries(error.response.data)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join('\n')
        mostrarMensaje(`Error al actualizar:\n${errors}`, 'error')
      } else {
        mostrarMensaje('Error al actualizar el perfil', 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  const cambiarContrasena = async () => {
    if (!validatePasswordForm()) return
    
    setSaving(true)
    
    try {
      await axiosInstance.post('cambiar-contrasena/', {
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password
      })

      mostrarMensaje('✅ Contraseña cambiada correctamente', 'success')
      setChangePasswordMode(false)
      setPasswordForm({
        old_password: '',
        new_password: '',
        confirm_password: ''
      })
    } catch (error) {
      console.error('Error cambiando contraseña:', error)
      
      if (error.response?.data?.error) {
        mostrarMensaje(error.response.data.error, 'error')
      } else if (error.response?.status === 400) {
        mostrarMensaje('Contraseña actual incorrecta', 'error')
      } else {
        mostrarMensaje('Error al cambiar la contraseña', 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 5000)
  }

  const getGrupoSanguineoColor = (grupo) => {
    const colores = {
      'A+': '#ff9999',
      'A-': '#ffcccc',
      'B+': '#99ff99',
      'B-': '#ccffcc',
      'AB+': '#9999ff',
      'AB-': '#ccccff',
      'O+': '#ffff99',
      'O-': '#ffffcc'
    }
    return colores[grupo] || '#f0f0f0'
  }

  const formatFecha = (fecha) => {
    try {
      return new Date(fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return fecha
    }
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <FaSpinner style={styles.loadingSpinner} />
        <p style={styles.loadingText}>{loadingMessage}</p>
        <p style={styles.loadingSubtext}>Por favor espera</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>
            <FaUser style={styles.titleIcon} />
            Mi Perfil
          </h1>
          <p style={styles.subtitle}>
            {user?.rol === 'patient' && 'Gestiona tu información personal y médica'}
            {user?.rol === 'doctor' && 'Información profesional y de contacto'}
            {user?.rol === 'admin' && 'Panel de administración de perfil'}
          </p>
        </div>
        <button onClick={() => navigate('/dashboard')} style={styles.backButton}>
          ← Volver al Dashboard
        </button>
      </div>

      {/* Mensajes */}
      {mensaje.texto && (
        <div style={mensaje.tipo === 'success' ? styles.successMessage : styles.errorMessage}>
          {mensaje.tipo === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
          <span style={styles.messageText}>{mensaje.texto}</span>
        </div>
      )}

      {/* Contenido del perfil */}
      <div style={styles.content}>
        {/* Columna izquierda */}
        <div style={styles.leftColumn}>
          {/* Tarjeta de información personal */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardTitle}>
                <FaUser style={styles.cardIcon} />
                <h2>Información Personal</h2>
              </div>
              {!editMode && !changePasswordMode && (
                <button 
                  onClick={() => setEditMode(true)} 
                  style={styles.editButton}
                  title="Editar perfil"
                >
                  <FaEdit /> Editar
                </button>
              )}
            </div>

            {editMode ? (
              // Modo edición
              <div style={styles.editForm}>
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <FaUser /> Nombre
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={editForm.first_name}
                      onChange={handleEditChange}
                      style={styles.input}
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <FaUser /> Apellido
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={editForm.last_name}
                      onChange={handleEditChange}
                      style={styles.input}
                      placeholder="Tu apellido"
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    <FaEnvelope /> Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleEditChange}
                    style={styles.input}
                    placeholder="correo@ejemplo.com"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    <FaPhone /> Teléfono
                  </label>
                  <input
                    type="text"
                    name="telefono"
                    value={editForm.telefono}
                    onChange={handleEditChange}
                    style={styles.input}
                    placeholder="+244 XXX XXX XXX"
                  />
                </div>

                {user?.rol === 'patient' && (
                  <>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>
                        <FaAllergies /> Alergias
                      </label>
                      <textarea
                        name="alergias"
                        value={editForm.alergias}
                        onChange={handleEditChange}
                        style={styles.textarea}
                        rows="3"
                        placeholder="Ej: Penicilina, polen, mariscos..."
                      />
                    </div>

                    <div style={styles.formRow}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>
                          <FaTint /> Grupo Sanguíneo
                        </label>
                        <select
                          name="grupo_sanguineo"
                          value={editForm.grupo_sanguineo}
                          onChange={handleEditChange}
                          style={styles.select}
                        >
                          <option value="">Seleccionar</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </select>
                      </div>
                    </div>

                    <div style={styles.formRow}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>
                          <FaAddressCard /> Contacto de emergencia
                        </label>
                        <input
                          type="text"
                          name="contacto_emergencia"
                          value={editForm.contacto_emergencia}
                          onChange={handleEditChange}
                          style={styles.input}
                          placeholder="Nombre completo"
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>
                          <FaPhone /> Tel. emergencia
                        </label>
                        <input
                          type="text"
                          name="telefono_emergencia"
                          value={editForm.telefono_emergencia}
                          onChange={handleEditChange}
                          style={styles.input}
                          placeholder="+244 XXX XXX XXX"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div style={styles.editButtons}>
                  <button 
                    onClick={guardarPerfil} 
                    style={styles.saveButton}
                    disabled={saving}
                  >
                    {saving ? <FaSpinner style={styles.spinner} /> : <FaSave />}
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                  <button 
                    onClick={() => setEditMode(false)} 
                    style={styles.cancelButton}
                    disabled={saving}
                  >
                    <FaTimes /> Cancelar
                  </button>
                </div>
              </div>
            ) : (
              // Modo visualización
              <div style={styles.infoDisplay}>
                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Nombre completo:</span>
                    <span style={styles.infoValue}>
                      {user?.first_name} {user?.last_name}
                    </span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Email:</span>
                    <span style={styles.infoValue}>{user?.email || 'No especificado'}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Teléfono:</span>
                    <span style={styles.infoValue}>{user?.telefono || 'No especificado'}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Rol:</span>
                    <span style={{
                      ...styles.rolBadge,
                      backgroundColor: user?.rol === 'admin' ? '#e74c3c' :
                                    user?.rol === 'doctor' ? '#3498db' :
                                    user?.rol === 'nurse' ? '#27ae60' : '#95a5a6'
                    }}>
                      {user?.rol === 'admin' && 'Administrador'}
                      {user?.rol === 'doctor' && 'Médico'}
                      {user?.rol === 'nurse' && 'Enfermería'}
                      {user?.rol === 'patient' && 'Paciente'}
                    </span>
                  </div>
                </div>
                
                {user?.rol === 'patient' && paciente && (
                  <div style={styles.medicalInfo}>
                    <h3 style={styles.medicalTitle}>
                      <FaHeart style={styles.medicalIcon} />
                      Información Médica
                    </h3>
                    <div style={styles.infoGrid}>
                      <div style={styles.infoItem}>
                        <span style={styles.infoLabel}>Alergias:</span>
                        <span style={styles.infoValue}>{paciente.alergias || 'No especificadas'}</span>
                      </div>
                      <div style={styles.infoItem}>
                        <span style={styles.infoLabel}>Grupo Sanguíneo:</span>
                        <span style={{
                          ...styles.grupoSanguineo,
                          backgroundColor: getGrupoSanguineoColor(paciente.grupo_sanguineo)
                        }}>
                          {paciente.grupo_sanguineo || 'No especificado'}
                        </span>
                      </div>
                      <div style={styles.infoItem}>
                        <span style={styles.infoLabel}>Contacto de emergencia:</span>
                        <span style={styles.infoValue}>{paciente.contacto_emergencia || 'No especificado'}</span>
                      </div>
                      <div style={styles.infoItem}>
                        <span style={styles.infoLabel}>Tel. emergencia:</span>
                        <span style={styles.infoValue}>{paciente.telefono_emergencia || 'No especificado'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tarjeta de seguridad (cambio de contraseña) */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardTitle}>
                <FaKey style={styles.cardIcon} />
                <h2>Seguridad</h2>
              </div>
              {!changePasswordMode && !editMode && (
                <button 
                  onClick={() => setChangePasswordMode(true)} 
                  style={styles.editButton}
                  title="Cambiar contraseña"
                >
                  <FaKey /> Cambiar contraseña
                </button>
              )}
            </div>

            {changePasswordMode ? (
              <div style={styles.editForm}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Contraseña actual:</label>
                  <input
                    type="password"
                    name="old_password"
                    value={passwordForm.old_password}
                    onChange={handlePasswordChange}
                    style={{...styles.input, borderColor: passwordErrors.old_password ? '#e74c3c' : '#ddd'}}
                    placeholder="••••••••"
                  />
                  {passwordErrors.old_password && (
                    <span style={styles.fieldError}>{passwordErrors.old_password}</span>
                  )}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Nueva contraseña:</label>
                  <input
                    type="password"
                    name="new_password"
                    value={passwordForm.new_password}
                    onChange={handlePasswordChange}
                    style={{...styles.input, borderColor: passwordErrors.new_password ? '#e74c3c' : '#ddd'}}
                    placeholder="••••••••"
                  />
                  {passwordErrors.new_password && (
                    <span style={styles.fieldError}>{passwordErrors.new_password}</span>
                  )}
                  <span style={styles.passwordHint}>Mínimo 4 caracteres</span>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Confirmar nueva contraseña:</label>
                  <input
                    type="password"
                    name="confirm_password"
                    value={passwordForm.confirm_password}
                    onChange={handlePasswordChange}
                    style={{...styles.input, borderColor: passwordErrors.confirm_password ? '#e74c3c' : '#ddd'}}
                    placeholder="••••••••"
                  />
                  {passwordErrors.confirm_password && (
                    <span style={styles.fieldError}>{passwordErrors.confirm_password}</span>
                  )}
                </div>

                <div style={styles.editButtons}>
                  <button 
                    onClick={cambiarContrasena} 
                    style={styles.saveButton}
                    disabled={saving}
                  >
                    {saving ? <FaSpinner style={styles.spinner} /> : <FaKey />}
                    {saving ? 'Cambiando...' : 'Cambiar Contraseña'}
                  </button>
                  <button 
                    onClick={() => {
                      setChangePasswordMode(false)
                      setPasswordForm({
                        old_password: '',
                        new_password: '',
                        confirm_password: ''
                      })
                      setPasswordErrors({})
                    }} 
                    style={styles.cancelButton}
                    disabled={saving}
                  >
                    <FaTimes /> Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div style={styles.passwordDisplay}>
                <FaKey style={styles.passwordIcon} />
                <span style={styles.passwordPlaceholder}>••••••••</span>
                <span style={styles.passwordHint}>La contraseña está encriptada por seguridad</span>
              </div>
            )}
          </div>
        </div>

        {/* Columna derecha - Historial médico (solo para pacientes) */}
        {user?.rol === 'patient' && (
          <div style={styles.rightColumn}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.cardTitle}>
                  <FaHistory style={styles.cardIcon} />
                  <h2>Historial Médico</h2>
                </div>
                <span style={styles.historialCount}>
                  {historialCitas.length} citas
                </span>
              </div>
              
              {historialCitas.length === 0 ? (
                <div style={styles.emptyState}>
                  <FaHistory style={styles.emptyIcon} />
                  <p style={styles.emptyText}>No hay citas en el historial</p>
                  <p style={styles.emptySubtext}>Las citas completadas aparecerán aquí</p>
                </div>
              ) : (
                <div style={styles.historialList}>
                  {historialCitas.map((cita, index) => (
                    <div key={cita.id} style={styles.historialItem}>
                      <div style={styles.historialHeader}>
                        <span style={styles.historialDate}>
                          <FaHistory style={styles.historialDateIcon} />
                          {formatFecha(cita.fecha)} - {cita.hora}
                        </span>
                        <span style={{
                          ...styles.historialBadge,
                          backgroundColor: cita.estado === 'completada' ? '#27ae60' : 
                                         cita.estado === 'cancelada' ? '#e74c3c' : '#f39c12'
                        }}>
                          {cita.estado}
                        </span>
                      </div>
                      <div style={styles.historialBody}>
                        <div style={styles.historialDoctor}>
                          <FaUserMd style={styles.historialDoctorIcon} />
                          Dr. {cita.doctor_nombre}
                        </div>
                        {cita.motivo && (
                          <div style={styles.historialMotivo}>
                            <strong>Motivo:</strong> {cita.motivo}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Estilos 
const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: 'var(--bg-primary)',
    minHeight: '100vh',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
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
  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  title: {
    fontSize: '28px',
    color: 'var(--text-primary)',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  titleIcon: {
    color: 'var(--color-patient)'
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    margin: 0
  },
  backButton: {
    backgroundColor: 'var(--text-muted)',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  successMessage: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '15px 20px',
    borderRadius: '10px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    border: '1px solid #c3e6cb'
  },
  errorMessage: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '15px 20px',
    borderRadius: '10px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    border: '1px solid #f5c6cb'
  },
  messageText: {
    fontSize: '14px',
    flex: 1
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px'
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  card: {
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '15px',
    padding: '25px',
    boxShadow: 'var(--box-shadow)',
    border: '1px solid var(--border-color)'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '15px'
  },
  cardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: 'var(--text-primary)'
  },
  cardIcon: {
    fontSize: '20px',
    color: 'var(--color-patient)'
  },
  editButton: {
    backgroundColor: 'var(--color-patient)',
    color: 'white',
    padding: '8px 15px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '13px'
  },
  infoDisplay: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '15px'
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  infoLabel: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  infoValue: {
    fontSize: '15px',
    color: 'var(--text-primary)',
    fontWeight: '500'
  },
  rolBadge: {
    padding: '4px 10px',
    borderRadius: '15px',
    color: 'white',
    fontSize: '12px',
    fontWeight: '500',
    display: 'inline-block',
    width: 'fit-content'
  },
  medicalInfo: {
    marginTop: '15px',
    paddingTop: '15px',
    borderTop: '1px dashed var(--border-color)'
  },
  medicalTitle: {
    fontSize: '16px',
    color: 'var(--text-primary)',
    marginBottom: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  medicalIcon: {
    color: '#e74c3c'
  },
  grupoSanguineo: {
    padding: '4px 10px',
    borderRadius: '15px',
    fontWeight: 'bold',
    display: 'inline-block',
    width: 'fit-content'
  },
  editForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  input: {
    padding: '10px',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    outline: 'none'
  },
  textarea: {
    padding: '10px',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    fontSize: '14px',
    resize: 'vertical',
    minHeight: '80px',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    outline: 'none'
  },
  select: {
    padding: '10px',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    outline: 'none'
  },
  editButtons: {
    display: 'flex',
    gap: '10px',
    marginTop: '15px'
  },
  saveButton: {
    backgroundColor: '#27ae60',
    color: 'white',
    padding: '12px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    flex: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500'
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
    color: 'white',
    padding: '12px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500'
  },
  fieldError: {
    color: '#e74c3c',
    fontSize: '12px',
    marginTop: '3px'
  },
  passwordDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: 'var(--text-muted)'
  },
  passwordIcon: {
    fontSize: '20px'
  },
  passwordPlaceholder: {
    fontSize: '20px',
    letterSpacing: '2px'
  },
  passwordHint: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginTop: '3px'
  },
  historialCount: {
    backgroundColor: 'var(--bg-tertiary)',
    padding: '4px 10px',
    borderRadius: '15px',
    fontSize: '12px',
    color: 'var(--text-secondary)'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px'
  },
  emptyIcon: {
    fontSize: '48px',
    color: 'var(--text-muted)',
    marginBottom: '15px'
  },
  emptyText: {
    fontSize: '16px',
    color: 'var(--text-secondary)',
    marginBottom: '5px'
  },
  emptySubtext: {
    fontSize: '14px',
    color: 'var(--text-muted)'
  },
  historialList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  historialItem: {
    backgroundColor: 'var(--bg-tertiary)',
    padding: '15px',
    borderRadius: '10px',
    border: '1px solid var(--border-color)'
  },
  historialHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    paddingBottom: '8px',
        borderBottom: '1px dashed var(--border-color)'
  },
  historialDate: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  historialDateIcon: {
    fontSize: '12px',
    color: 'var(--color-patient)'
  },
  historialBadge: {
    padding: '3px 8px',
    borderRadius: '12px',
    color: 'white',
    fontSize: '11px',
    fontWeight: '500',
    textTransform: 'capitalize'
  },
  historialBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  historialDoctor: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  historialDoctorIcon: {
    fontSize: '12px',
    color: '#e67e22'
  },
  historialMotivo: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    lineHeight: '1.5',
    backgroundColor: 'var(--bg-secondary)',
    padding: '8px',
    borderRadius: '6px',
    border: '1px solid var(--border-color)'
  },
  spinner: {
    animation: 'spin 1s linear infinite'
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

export default Perfil