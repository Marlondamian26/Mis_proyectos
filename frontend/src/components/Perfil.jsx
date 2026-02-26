import React, { useEffect, useState } from 'react'
import axiosInstance from '../services/auth'
import { useNavigate } from 'react-router-dom'
import { FaUser, FaEnvelope, FaPhone, FaBirthdayCake, FaAllergies, FaTint, FaUserMd, FaHistory, FaEdit, FaKey, FaSave, FaTimes } from 'react-icons/fa'

function Perfil() {
  const [user, setUser] = useState(null)
  const [paciente, setPaciente] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [changePasswordMode, setChangePasswordMode] = useState(false)
  const [historialCitas, setHistorialCitas] = useState([])
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' })
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

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      // Obtener usuario actual
      const userResponse = await axiosInstance.get('usuario-actual/')
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
        const pacientesResponse = await axiosInstance.get('pacientes/')
        const miPaciente = pacientesResponse.data.find(p => p.usuario?.id === userResponse.data.id)
        if (miPaciente) {
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
        const citasResponse = await axiosInstance.get('citas/')
        const citasCompletadas = citasResponse.data.filter(c => 
          c.estado === 'completada' || c.estado === 'cancelada' || c.estado === 'no_asistio'
        )
        setHistorialCitas(citasCompletadas)
      }
    } catch (error) {
      console.error('Error cargando perfil:', error)
      mostrarMensaje('Error al cargar el perfil', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    })
  }

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value
    })
  }

  const guardarPerfil = async () => {
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

      mostrarMensaje('Perfil actualizado correctamente', 'success')
      setEditMode(false)
      fetchUserData() // Recargar datos
    } catch (error) {
      console.error('Error actualizando perfil:', error)
      mostrarMensaje('Error al actualizar el perfil', 'error')
    }
  }

  const cambiarContrasena = async () => {
    // Validaciones
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      mostrarMensaje('Las contraseñas no coinciden', 'error')
      return
    }

    if (passwordForm.new_password.length < 4) {
      mostrarMensaje('La contraseña debe tener al menos 4 caracteres', 'error')
      return
    }

    try {
      // Nota: Este endpoint requiere implementación en el backend
      await axiosInstance.post('cambiar-contrasena/', {
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password
      })

      mostrarMensaje('Contraseña cambiada correctamente', 'success')
      setChangePasswordMode(false)
      setPasswordForm({
        old_password: '',
        new_password: '',
        confirm_password: ''
      })
    } catch (error) {
      console.error('Error cambiando contraseña:', error)
      mostrarMensaje('Error al cambiar la contraseña. Verifica tu contraseña actual.', 'error')
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

  if (loading) {
    return <div style={styles.loading}>Cargando perfil...</div>
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1>👤 Mi Perfil</h1>
        <button onClick={() => navigate('/dashboard')} style={styles.backButton}>
          ← Volver al Dashboard
        </button>
      </div>

      {/* Mensajes */}
      {mensaje.texto && (
        <div style={mensaje.tipo === 'success' ? styles.successMessage : styles.errorMessage}>
          {mensaje.texto}
        </div>
      )}

      {/* Contenido del perfil */}
      <div style={styles.content}>
        {/* Columna izquierda - Información personal */}
        <div style={styles.leftColumn}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2>Información Personal</h2>
              {!editMode && !changePasswordMode && (
                <button onClick={() => setEditMode(true)} style={styles.editButton}>
                  <FaEdit /> Editar
                </button>
              )}
            </div>

            {editMode ? (
              // Modo edición
              <div style={styles.editForm}>
                <div style={styles.formGroup}>
                  <label><FaUser /> Nombre:</label>
                  <input
                    type="text"
                    name="first_name"
                    value={editForm.first_name}
                    onChange={handleEditChange}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label><FaUser /> Apellido:</label>
                  <input
                    type="text"
                    name="last_name"
                    value={editForm.last_name}
                    onChange={handleEditChange}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label><FaEnvelope /> Email:</label>
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleEditChange}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label><FaPhone /> Teléfono:</label>
                  <input
                    type="text"
                    name="telefono"
                    value={editForm.telefono}
                    onChange={handleEditChange}
                    style={styles.input}
                  />
                </div>

                {user.rol === 'patient' && (
                  <>
                    <div style={styles.formGroup}>
                      <label><FaAllergies /> Alergias:</label>
                      <textarea
                        name="alergias"
                        value={editForm.alergias}
                        onChange={handleEditChange}
                        style={styles.textarea}
                        rows="3"
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label><FaTint /> Grupo Sanguíneo:</label>
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
                    <div style={styles.formGroup}>
                      <label>Contacto de emergencia:</label>
                      <input
                        type="text"
                        name="contacto_emergencia"
                        value={editForm.contacto_emergencia}
                        onChange={handleEditChange}
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label>Tel. emergencia:</label>
                      <input
                        type="text"
                        name="telefono_emergencia"
                        value={editForm.telefono_emergencia}
                        onChange={handleEditChange}
                        style={styles.input}
                      />
                    </div>
                  </>
                )}

                <div style={styles.editButtons}>
                  <button onClick={guardarPerfil} style={styles.saveButton}>
                    <FaSave /> Guardar
                  </button>
                  <button onClick={() => setEditMode(false)} style={styles.cancelButton}>
                    <FaTimes /> Cancelar
                  </button>
                </div>
              </div>
            ) : (
              // Modo visualización
              <div style={styles.infoDisplay}>
                <p><strong><FaUser /> Nombre:</strong> {user?.first_name} {user?.last_name}</p>
                <p><strong><FaEnvelope /> Email:</strong> {user?.email}</p>
                <p><strong><FaPhone /> Teléfono:</strong> {user?.telefono}</p>
                <p><strong><FaBirthdayCake /> Rol:</strong> {user?.rol}</p>
                
                {user?.rol === 'patient' && paciente && (
                  <>
                    <p><strong><FaAllergies /> Alergias:</strong> {paciente.alergias || 'No especificadas'}</p>
                    <p><strong><FaTint /> Grupo Sanguíneo:</strong> {
                      paciente.grupo_sanguineo ? (
                        <span style={{
                          ...styles.grupoSanguineo,
                          backgroundColor: getGrupoSanguineoColor(paciente.grupo_sanguineo)
                        }}>
                          {paciente.grupo_sanguineo}
                        </span>
                      ) : 'No especificado'
                    }</p>
                    <p><strong>Contacto de emergencia:</strong> {paciente.contacto_emergencia || 'No especificado'}</p>
                    <p><strong>Tel. emergencia:</strong> {paciente.telefono_emergencia || 'No especificado'}</p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Cambio de contraseña */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2>Seguridad</h2>
              {!changePasswordMode && !editMode && (
                <button onClick={() => setChangePasswordMode(true)} style={styles.editButton}>
                  <FaKey /> Cambiar contraseña
                </button>
              )}
            </div>

            {changePasswordMode ? (
              <div style={styles.editForm}>
                <div style={styles.formGroup}>
                  <label>Contraseña actual:</label>
                  <input
                    type="password"
                    name="old_password"
                    value={passwordForm.old_password}
                    onChange={handlePasswordChange}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label>Nueva contraseña:</label>
                  <input
                    type="password"
                    name="new_password"
                    value={passwordForm.new_password}
                    onChange={handlePasswordChange}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label>Confirmar nueva contraseña:</label>
                  <input
                    type="password"
                    name="confirm_password"
                    value={passwordForm.confirm_password}
                    onChange={handlePasswordChange}
                    style={styles.input}
                  />
                </div>
                <div style={styles.editButtons}>
                  <button onClick={cambiarContrasena} style={styles.saveButton}>
                    <FaKey /> Cambiar
                  </button>
                  <button onClick={() => setChangePasswordMode(false)} style={styles.cancelButton}>
                    <FaTimes /> Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <p style={styles.passwordHint}>••••••••</p>
            )}
          </div>
        </div>

        {/* Columna derecha - Historial médico */}
        {user?.rol === 'patient' && (
          <div style={styles.rightColumn}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h2><FaHistory /> Historial Médico</h2>
              </div>
              
              {historialCitas.length === 0 ? (
                <p style={styles.emptyState}>No hay citas en el historial</p>
              ) : (
                <div style={styles.historialList}>
                  {historialCitas.map(cita => (
                    <div key={cita.id} style={styles.historialItem}>
                      <div style={styles.historialHeader}>
                        <strong>{cita.fecha} - {cita.hora}</strong>
                        <span style={{
                          ...styles.badge,
                          backgroundColor: cita.estado === 'completada' ? '#27ae60' : '#e74c3c'
                        }}>
                          {cita.estado}
                        </span>
                      </div>
                      <p><FaUserMd /> Dr. {cita.doctor_nombre}</p>
                      {cita.motivo && <p><strong>Motivo:</strong> {cita.motivo}</p>}
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

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  backButton: {
    backgroundColor: '#6c757d',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px'
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
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '1px solid #ecf0f1',
    paddingBottom: '10px'
  },
  editButton: {
    backgroundColor: '#3498db',
    color: 'white',
    padding: '5px 10px',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '12px'
  },
  infoDisplay: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  editForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    fontWeight: 'bold',
    marginBottom: '5px',
    color: '#2c3e50'
  },
  input: {
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px'
  },
  textarea: {
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
    resize: 'vertical'
  },
  select: {
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px'
  },
  editButtons: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px'
  },
  saveButton: {
    backgroundColor: '#27ae60',
    color: 'white',
    padding: '10px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px'
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
    color: 'white',
    padding: '10px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px'
  },
  grupoSanguineo: {
    padding: '3px 8px',
    borderRadius: '3px',
    fontWeight: 'bold',
    display: 'inline-block'
  },
  passwordHint: {
    color: '#7f8c8d',
    fontStyle: 'italic'
  },
  historialList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  historialItem: {
    backgroundColor: '#f8f9fa',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #e0e0e0'
  },
  historialHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '5px'
  },
  badge: {
    padding: '2px 5px',
    borderRadius: '3px',
    color: 'white',
    fontSize: '11px'
  },
  emptyState: {
    textAlign: 'center',
    color: '#7f8c8d',
    padding: '40px',
    fontStyle: 'italic'
  },
  successMessage: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '15px',
    borderRadius: '5px',
    marginBottom: '20px',
    textAlign: 'center'
  },
  errorMessage: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '15px',
    borderRadius: '5px',
    marginBottom: '20px',
    textAlign: 'center'
  },
  loading: {
    textAlign: 'center',
    fontSize: '20px',
    marginTop: '50px',
    color: '#3498db'
  }
}

export default Perfil