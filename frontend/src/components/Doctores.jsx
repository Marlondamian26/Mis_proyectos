import React, { useEffect, useState } from 'react'
import axiosInstance from '../services/auth'
import { useNavigate } from 'react-router-dom'
import { FaStar, FaMapMarkerAlt, FaPhone, FaEnvelope, FaCalendarAlt } from 'react-icons/fa'

function Doctores() {
  const [doctores, setDoctores] = useState([])
  const [especialidades, setEspecialidades] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroEspecialidad, setFiltroEspecialidad] = useState('')
  const [doctorSeleccionado, setDoctorSeleccionado] = useState(null)
  const [horarios, setHorarios] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    fetchDoctores()
    fetchEspecialidades()
  }, [])

  const fetchDoctores = async () => {
    try {
      const response = await axiosInstance.get('doctores-publicos/')
      const doctoresData = Array.isArray(response.data) ? response.data : response.data.results || []
      setDoctores(doctoresData)
    } catch (error) {
      console.error('Error cargando doctores:', error)
      setDoctores([])
    } finally {
      setLoading(false)
    }
  }

  const fetchEspecialidades = async () => {
    try {
      const response = await axiosInstance.get('especialidades-publicas/')
      const especialidadesData = Array.isArray(response.data) ? response.data : response.data.results || []
      setEspecialidades(especialidadesData)
    } catch (error) {
      console.error('Error cargando especialidades:', error)
      setEspecialidades([])
    }
  }

  const fetchHorarios = async (doctorId) => {
    try {
      const response = await axiosInstance.get(`horarios/?doctor=${doctorId}`)
      const horariosData = Array.isArray(response.data) ? response.data : []
      setHorarios(horariosData)
    } catch (error) {
      console.error('Error cargando horarios:', error)
      setHorarios([])
    }
  }

  const verDetalles = (doctor) => {
    setDoctorSeleccionado(doctor)
    fetchHorarios(doctor.id)
  }

  const cerrarModal = () => {
    setDoctorSeleccionado(null)
    setHorarios([])
  }

  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

  // Función para obtener el nombre de la especialidad
  const getEspecialidadNombre = (doctor) => {
    if (doctor.especialidad_nombre) {
      return doctor.especialidad_nombre
    } else if (doctor.otra_especialidad) {
      return `${doctor.otra_especialidad} ✏️`
    }
    return 'Especialidad no especificada'
  }

  // Filtrar doctores por especialidad (usando el nombre para la comparación)
  const doctoresArray = Array.isArray(doctores) ? doctores : []
  const doctoresFiltrados = filtroEspecialidad
    ? doctoresArray.filter(d => {
        const espNombre = d.especialidad_nombre || d.otra_especialidad
        return espNombre === filtroEspecialidad
      })
    : doctoresArray

  if (loading) {
    return <div style={styles.loading}>Cargando doctores...</div>
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1>👨‍⚕️ Nuestros Especialistas</h1>
        <button onClick={() => navigate('/dashboard')} style={styles.backButton}>
          ← Volver al Dashboard
        </button>
      </div>

      {/* Filtros */}
      <div style={styles.filtros}>
        <label style={styles.filtroLabel}>Filtrar por especialidad:</label>
        <select 
          value={filtroEspecialidad} 
          onChange={(e) => setFiltroEspecialidad(e.target.value)}
          style={styles.filtroSelect}
        >
          <option value="">Todas las especialidades</option>
          {especialidades.map(esp => (
            <option key={esp.id} value={esp.nombre}>{esp.nombre}</option>
          ))}
        </select>
      </div>

      {/* Grid de doctores */}
      <div style={styles.grid}>
        {doctoresFiltrados.map(doctor => (
          <div key={doctor.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <img 
                src={doctor.usuario?.foto_perfil || 'https://via.placeholder.com/100'} 
                alt={doctor.usuario?.first_name}
                style={styles.avatar}
              />
              <h3 style={styles.doctorName}>
                Dr. {doctor.usuario?.first_name} {doctor.usuario?.last_name}
              </h3>
            </div>
            
            <div style={styles.cardBody}>
              <p style={styles.especialidad}>
                <strong>🔬 {getEspecialidadNombre(doctor)}</strong>
              </p>
              <p style={styles.biografia}>
                {doctor.biografia?.substring(0, 100)}...
              </p>
            </div>
            
            <div style={styles.cardFooter}>
              <button 
                onClick={() => verDetalles(doctor)}
                style={styles.verMasButton}
              >
                Ver disponibilidad
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de detalles del doctor */}
      {doctorSeleccionado && (
        <div style={styles.modalOverlay} onClick={cerrarModal}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <button style={styles.modalClose} onClick={cerrarModal}>×</button>
            
            <div style={styles.modalHeader}>
              <img 
                src={doctorSeleccionado.usuario?.foto_perfil || 'https://via.placeholder.com/150'} 
                alt={doctorSeleccionado.usuario?.first_name}
                style={styles.modalAvatar}
              />
              <div>
                <h2>Dr. {doctorSeleccionado.usuario?.first_name} {doctorSeleccionado.usuario?.last_name}</h2>
                <p style={styles.modalEspecialidad}>{getEspecialidadNombre(doctorSeleccionado)}</p>
              </div>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.modalSection}>
                <h4>📋 Información Profesional</h4>
                <p><strong>Biografía:</strong> {doctorSeleccionado.biografia || 'No especificada'}</p>
              </div>

              <div style={styles.modalSection}>
                <h4>📞 Contacto</h4>
                <p><FaPhone /> {doctorSeleccionado.usuario?.telefono || 'No especificado'}</p>
                <p><FaEnvelope /> {doctorSeleccionado.usuario?.email || 'No especificado'}</p>
              </div>

              <div style={styles.modalSection}>
                <h4>🕒 Horarios de Atención</h4>
                {horarios.length > 0 ? (
                  <div style={styles.horariosGrid}>
                    {horarios.map(horario => (
                      <div key={horario.id} style={styles.horarioItem}>
                        <strong>{diasSemana[horario.dia_semana]}:</strong>
                        <span>{horario.hora_inicio} - {horario.hora_fin}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No hay horarios configurados</p>
                )}
              </div>

              <button 
                style={styles.reservarButton}
                onClick={() => {
                  cerrarModal()
                  navigate('/citas', { state: { doctorSeleccionado } })
                }}
              >
                <FaCalendarAlt /> Reservar Cita
              </button>
            </div>
          </div>
        </div>
      )}

      {doctoresFiltrados.length === 0 && !loading && (
        <div style={styles.noResults}>
          No se encontraron doctores {filtroEspecialidad && `con especialidad "${filtroEspecialidad}"`}
        </div>
      )}
    </div>
  )
}

// Estilos (se mantienen igual, solo eliminamos la referencia a colegiado si existía en estilos)
const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: 'var(--bg-primary)',
    minHeight: '100vh'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    backgroundColor: 'var(--bg-secondary)',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: 'var(--box-shadow)',
    border: '1px solid var(--border-color)'
  },
  backButton: {
    backgroundColor: 'var(--text-muted)',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  filtros: {
    backgroundColor: 'var(--bg-secondary)',
    padding: '20px',
    borderRadius: '10px',
    marginBottom: '30px',
    boxShadow: 'var(--box-shadow)',
    border: '1px solid var(--border-color)'
  },
  filtroLabel: {
    marginRight: '10px',
    fontWeight: 'bold',
    color: 'var(--text-primary)'
  },
  filtroSelect: {
    padding: '8px',
    borderRadius: '5px',
    border: '1px solid var(--border-color)',
    fontSize: '14px',
    minWidth: '200px',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px'
  },
  card: {
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: 'var(--box-shadow)',
    border: '1px solid var(--border-color)',
    transition: 'transform 0.3s'
  },
  cardHeader: {
    backgroundColor: 'var(--color-doctor)',
    color: 'white',
    padding: '20px',
    textAlign: 'center'
  },
  avatar: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    border: '4px solid white',
    marginBottom: '10px'
  },
  doctorName: {
    margin: '0',
    fontSize: '18px',
    color: 'white'
  },
  cardBody: {
    padding: '20px',
    color: 'var(--text-primary)'
  },
  especialidad: {
    color: 'var(--color-doctor)',
    marginBottom: '10px'
  },
  biografia: {
    color: 'var(--text-primary)',
    fontSize: '14px',
    lineHeight: '1.5'
  },
  cardFooter: {
    padding: '20px',
    borderTop: '1px solid var(--border-color)',
    textAlign: 'center'
  },
  verMasButton: {
    backgroundColor: 'var(--color-doctor)',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    width: '100%',
    fontSize: '14px'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '10px',
    padding: '30px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '80vh',
    overflowY: 'auto',
    position: 'relative',
    border: '1px solid var(--border-color)'
  },
  modalClose: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: 'var(--text-muted)'
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '30px'
  },
  modalAvatar: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid var(--color-doctor)'
  },
  modalEspecialidad: {
    color: 'var(--color-doctor)',
    fontSize: '16px',
    marginTop: '5px'
  },
  modalBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    color: 'var(--text-primary)'
  },
  modalSection: {
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '20px'
  },
  horariosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
    marginTop: '10px'
  },
  horarioItem: {
    backgroundColor: 'var(--bg-tertiary)',
    padding: '8px',
    borderRadius: '5px',
    display: 'flex',
    flexDirection: 'column',
    fontSize: '14px',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-color)'
  },
  reservarButton: {
    backgroundColor: 'var(--color-doctor)',
    color: 'white',
    padding: '15px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginTop: '20px'
  },
  loading: {
    textAlign: 'center',
    fontSize: '20px',
    marginTop: '50px',
    color: 'var(--color-doctor)'
  },
  noResults: {
    textAlign: 'center',
    padding: '40px',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '10px',
    color: 'var(--text-muted)',
    border: '1px solid var(--border-color)'
  }
}

export default Doctores