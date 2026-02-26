import React, { useEffect, useState } from 'react'
import axiosInstance from '../services/auth'
import { useNavigate } from 'react-router-dom'
import { FaStar, FaMapMarkerAlt, FaPhone, FaEnvelope, FaCalendarAlt } from 'react-icons/fa'

function Doctores() {
  const [doctores, setDoctores] = useState([]) // Array vacío por defecto
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
      const response = await axiosInstance.get('doctores/')
      // Asegurar que es array
      const doctoresData = Array.isArray(response.data) ? response.data : []
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
      const response = await axiosInstance.get('especialidades/')
      const especialidadesData = Array.isArray(response.data) ? response.data : []
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

  // Asegurar que doctores es array antes de filtrar
  const doctoresArray = Array.isArray(doctores) ? doctores : []
  const doctoresFiltrados = filtroEspecialidad
    ? doctoresArray.filter(d => d.especialidad === filtroEspecialidad)
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
                <strong>🔬 {doctor.especialidad}</strong>
              </p>
              <p style={styles.colegiado}>
                📋 Nº Colegiado: {doctor.numero_colegiado}
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
                <p style={styles.modalEspecialidad}>{doctorSeleccionado.especialidad}</p>
              </div>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.modalSection}>
                <h4>📋 Información Profesional</h4>
                <p><strong>Nº Colegiado:</strong> {doctorSeleccionado.numero_colegiado}</p>
                <p><strong>Biografía:</strong> {doctorSeleccionado.biografia}</p>
              </div>

              <div style={styles.modalSection}>
                <h4>📞 Contacto</h4>
                <p><FaPhone /> {doctorSeleccionado.usuario?.telefono}</p>
                <p><FaEnvelope /> {doctorSeleccionado.usuario?.email}</p>
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
  filtros: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    marginBottom: '30px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  filtroLabel: {
    marginRight: '10px',
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  filtroSelect: {
    padding: '8px',
    borderRadius: '5px',
    border: '1px solid #ddd',
    fontSize: '14px',
    minWidth: '200px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s',
    ':hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 6px 12px rgba(0,0,0,0.15)'
    }
  },
  cardHeader: {
    backgroundColor: '#3498db',
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
    fontSize: '18px'
  },
  cardBody: {
    padding: '20px'
  },
  especialidad: {
    color: '#3498db',
    marginBottom: '10px'
  },
  colegiado: {
    color: '#7f8c8d',
    fontSize: '14px',
    marginBottom: '10px'
  },
  biografia: {
    color: '#34495e',
    fontSize: '14px',
    lineHeight: '1.5'
  },
  cardFooter: {
    padding: '20px',
    borderTop: '1px solid #ecf0f1',
    textAlign: 'center'
  },
  verMasButton: {
    backgroundColor: '#3498db',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    width: '100%',
    fontSize: '14px',
    ':hover': {
      backgroundColor: '#2980b9'
    }
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
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '30px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '80vh',
    overflowY: 'auto',
    position: 'relative'
  },
  modalClose: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#7f8c8d'
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
    objectFit: 'cover'
  },
  modalEspecialidad: {
    color: '#3498db',
    fontSize: '16px',
    marginTop: '5px'
  },
  modalBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  modalSection: {
    borderBottom: '1px solid #ecf0f1',
    paddingBottom: '20px'
  },
  horariosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
    marginTop: '10px'
  },
  horarioItem: {
    backgroundColor: '#f8f9fa',
    padding: '8px',
    borderRadius: '5px',
    display: 'flex',
    flexDirection: 'column',
    fontSize: '14px'
  },
  reservarButton: {
    backgroundColor: '#27ae60',
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
    marginTop: '20px',
    ':hover': {
      backgroundColor: '#219a52'
    }
  },
  loading: {
    textAlign: 'center',
    fontSize: '20px',
    marginTop: '50px',
    color: '#3498db'
  },
  noResults: {
    textAlign: 'center',
    padding: '40px',
    backgroundColor: 'white',
    borderRadius: '10px',
    color: '#7f8c8d'
  }
}

export default Doctores