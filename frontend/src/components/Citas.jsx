import React, { useEffect, useState } from 'react'
import axiosInstance from '../services/auth'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { FaCalendarAlt, FaClock, FaUserMd, FaNotesMedical, FaCheck, FaTimes } from 'react-icons/fa'
import { format, addDays, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

function Citas() {
  const { t } = useLanguage()
  const [citas, setCitas] = useState([]) // Inicializado como array vacío
  const [doctores, setDoctores] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [horariosDisponibles, setHorariosDisponibles] = useState([])
  const [cargandoHorarios, setCargandoHorarios] = useState(false)
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' })
  const navigate = useNavigate()
  const location = useLocation()
  
  const [nuevaCita, setNuevaCita] = useState({
    doctor: location.state?.doctorSeleccionado?.id || '',
    fecha: format(new Date(), 'yyyy-MM-dd'),
    hora: '',
    motivo: ''
  })

  useEffect(() => {
    fetchCitas()
    fetchDoctores()
  }, [])

  useEffect(() => {
    if (nuevaCita.doctor && nuevaCita.fecha) {
      fetchHorariosDisponibles()
    }
  }, [nuevaCita.doctor, nuevaCita.fecha])

  const fetchCitas = async () => {
    try {
      const response = await axiosInstance.get('mis-citas/')
      // Asegurar que siempre sea un array
      const citasData = Array.isArray(response.data) ? response.data : response.data.results || []
      setCitas(citasData)
    } catch (error) {
      console.error('Error cargando citas:', error)
      setCitas([]) // En caso de error, dejar array vacío
      mostrarMensaje(t('connectionError'), 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchDoctores = async () => {
    try {
      const response = await axiosInstance.get('doctores-publicos/')
      const doctoresData = Array.isArray(response.data) ? response.data : response.data.results || []
      setDoctores(doctoresData)
    } catch (error) {
      console.error('Error cargando doctores:', error)
      setDoctores([])
    }
  }

  const fetchHorariosDisponibles = async () => {
    setCargandoHorarios(true)
    try {
      const response = await axiosInstance.get(`horarios/?doctor=${nuevaCita.doctor}`)
      const horariosData = Array.isArray(response.data) ? response.data : []
      
      const citasResponse = await axiosInstance.get('citas/', {
        params: {
          doctor: nuevaCita.doctor,
          fecha: nuevaCita.fecha
        }
      })
      const citasOcupadas = Array.isArray(citasResponse.data) ? citasResponse.data : []
      const horariosOcupados = citasOcupadas.map(c => c.hora)
      
      const slots = []
      horariosData.forEach(horario => {
        if (!horario.activo) return
        
        const [horaInicio, minInicio] = horario.hora_inicio.split(':').map(Number)
        const [horaFin, minFin] = horario.hora_fin.split(':').map(Number)
        
        let horaActual = new Date()
        horaActual.setHours(horaInicio, minInicio, 0)
        
        const horaFinal = new Date()
        horaFinal.setHours(horaFin, minFin, 0)
        
        while (horaActual < horaFinal) {
          const horaStr = format(horaActual, 'HH:mm')
          if (!horariosOcupados.includes(horaStr)) {
            slots.push(horaStr)
          }
          horaActual.setMinutes(horaActual.getMinutes() + 30)
        }
      })
      
      setHorariosDisponibles(slots)
    } catch (error) {
      console.error('Error cargando horarios:', error)
      setHorariosDisponibles([])
    } finally {
      setCargandoHorarios(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNuevaCita(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!nuevaCita.doctor || !nuevaCita.fecha || !nuevaCita.hora) {
      mostrarMensaje(t('requiredField'), 'error')
      return
    }

    try {
      await axiosInstance.post('citas/', nuevaCita)
      
      mostrarMensaje(t('appointmentBooked'), 'success')
      setShowForm(false)
      fetchCitas()
      
      setNuevaCita({
        doctor: '',
        fecha: format(new Date(), 'yyyy-MM-dd'),
        hora: '',
        motivo: ''
      })
    } catch (error) {
      console.error('Error creando cita:', error)
      mostrarMensaje(error.response?.data?.message || t('errorSaving', { type: t('appointments').toLowerCase() }), 'error')
    }
  }

  const cancelarCita = async (citaId) => {
    if (!window.confirm(t('confirmCancel'))) return
    
    try {
      await axiosInstance.delete(`citas/${citaId}/`)
      mostrarMensaje(t('appointmentCancelled'), 'success')
      fetchCitas()
    } catch (error) {
      console.error('Error cancelando cita:', error)
      mostrarMensaje(t('errorDeleting', { type: t('appointments').toLowerCase() }), 'error')
    }
  }

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 5000)
  }

  const getEstadoBadge = (estado) => {
    const estilos = {
      pendiente: { backgroundColor: 'var(--color-pending)', color: 'white' },
      confirmada: { backgroundColor: 'var(--color-confirmed)', color: 'white' },
      completada: { backgroundColor: 'var(--color-completed)', color: 'white' },
      cancelada: { backgroundColor: 'var(--color-cancelled)', color: 'white' },
      no_asistio: { backgroundColor: 'var(--color-no-show)', color: 'white' }
    }
    return <span style={{...styles.badge, ...estilos[estado]}}>{estado}</span>
  }

  // Verificar que citas es un array antes de filtrar
  const citasArray = Array.isArray(citas) ? citas : []
  const now = new Date()
  const citasProximas = citasArray.filter(c => new Date(`${c.fecha}T${c.hora}`) > now)
  const citasPasadas = citasArray.filter(c => new Date(`${c.fecha}T${c.hora}`) <= now)

  if (loading) {
    return <div style={styles.loading}>{t('loading')}</div>
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>📅 {t('appointmentsManagement')}</h1>
        <div>
          <button onClick={() => navigate('/dashboard')} style={styles.backButton}>
            ← {t('back')}
          </button>
          <button onClick={() => setShowForm(!showForm)} style={styles.newButton}>
            {showForm ? '✕ ' + t('cancel') : '+ ' + t('newAppointment')}
          </button>
        </div>
      </div>

      {mensaje.texto && (
        <div style={mensaje.tipo === 'success' ? styles.successMessage : styles.errorMessage}>
          {mensaje.texto}
        </div>
      )}

      {showForm && (
        <div style={styles.formContainer}>
          <h2>{t('bookAppointment')}</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>{t('doctor')}:</label>
              <select
                name="doctor"
                value={nuevaCita.doctor}
                onChange={handleInputChange}
                style={styles.select}
                required
              >
                <option value="">{t('selectDoctor')}</option>
                {doctores.map(doctor => {
                  // Determinar la especialidad a mostrar
                  const especialidadMostrar = doctor.especialidad_nombre || 
                                             doctor.otra_especialidad || 
                                             'Especialidad no especificada';
                  
                  // Agregar indicador si es una especialidad nueva (no en el catálogo)
                  const esNueva = doctor.otra_especialidad && !doctor.especialidad_nueva;
                  
                  return (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.usuario?.first_name} {doctor.usuario?.last_name} - {especialidadMostrar}
                      {esNueva && ' ✏️'}
                    </option>
                  );
                })}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>{t('date')}:</label>
              <input
                type="date"
                name="fecha"
                value={nuevaCita.fecha}
                onChange={handleInputChange}
                min={format(new Date(), 'yyyy-MM-dd')}
                max={format(addDays(new Date(), 30), 'yyyy-MM-dd')}
                style={styles.input}
                required
              />
            </div>

            {cargandoHorarios ? (
              <div style={styles.loadingSmall}>{t('loadingAvailableTimes')}</div>
            ) : (
              nuevaCita.doctor && nuevaCita.fecha && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>{t('availableTime')}:</label>
                  {horariosDisponibles.length > 0 ? (
                    <div style={styles.horariosGrid}>
                      {horariosDisponibles.map(hora => (
                        <button
                          key={hora}
                          type="button"
                          onClick={() => setNuevaCita(prev => ({ ...prev, hora }))}
                          style={{
                            ...styles.horaButton,
                            ...(nuevaCita.hora === hora ? styles.horaButtonSelected : {})
                          }}
                        >
                          {hora}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p style={styles.noHorarios}>{t('noAvailableTimes')}</p>
                  )}
                </div>
              )
            )}

            <div style={styles.formGroup}>
              <label style={styles.label}>Motivo de la consulta:</label>
              <textarea
                name="motivo"
                value={nuevaCita.motivo}
                onChange={handleInputChange}
                style={styles.textarea}
                rows="3"
                placeholder="Describe el motivo de tu consulta..."
              />
            </div>

            <button 
              type="submit" 
              style={styles.submitButton}
              disabled={!nuevaCita.hora}
            >
              {t('confirmReservation')}
            </button>
          </form>
        </div>
      )}

      <div style={styles.citasContainer}>
        <div style={styles.section}>
          <h2>📌 {t('upcomingAppointments')}</h2>
          {citasProximas.length === 0 ? (
            <p style={styles.emptyState}>No tienes citas próximas</p>
          ) : (
            citasProximas.map(cita => (
              <div key={cita.id} style={styles.citaCard}>
                <div style={styles.citaHeader}>
                  <div style={styles.citaDoctor}>
                    <FaUserMd /> Dr. {cita.doctor_nombre}
                  </div>
                  {getEstadoBadge(cita.estado)}
                </div>
                <div style={styles.citaBody}>
                  <p><FaCalendarAlt /> Fecha: {format(parseISO(cita.fecha), 'PPP', { locale: es })}</p>
                  <p><FaClock /> Hora: {cita.hora}</p>
                  {cita.motivo && (
                    <p><FaNotesMedical /> Motivo: {cita.motivo}</p>
                  )}
                </div>
                {cita.estado !== 'cancelada' && cita.estado !== 'completada' && (
                  <div style={styles.citaFooter}>
                    <button onClick={() => cancelarCita(cita.id)} style={styles.cancelButton}>
                      <FaTimes /> {t('cancelAppointment')}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div style={styles.section}>
          <h2>📋 {t('appointmentHistory')}</h2>
          {citasPasadas.length === 0 ? (
            <p style={styles.emptyState}>No hay citas en el historial</p>
          ) : (
            citasPasadas.map(cita => (
              <div key={cita.id} style={styles.citaCardHistorial}>
                <div style={styles.citaHeader}>
                  <div style={styles.citaDoctor}>
                    <FaUserMd /> Dr. {cita.doctor_nombre}
                  </div>
                  {getEstadoBadge(cita.estado)}
                </div>
                <div style={styles.citaBody}>
                  <p><FaCalendarAlt /> {format(parseISO(cita.fecha), 'PPP', { locale: es })} - {cita.hora}</p>
                  {cita.motivo && <p>Motivo: {cita.motivo}</p>}
                </div>
              </div>
            ))
          )}
        </div>
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
    fontSize: '14px',
    marginRight: '10px'
  },
  newButton: {
    backgroundColor: 'var(--color-patient)',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  successMessage: {
    backgroundColor: 'var(--color-success-bg)',
    color: 'var(--color-success-text)',
    padding: '15px 20px',
    borderRadius: '10px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    border: '1px solid var(--color-success)'
  },
  errorMessage: {
    backgroundColor: 'var(--color-error-bg)',
    color: 'var(--color-error-text)',
    padding: '15px 20px',
    borderRadius: '10px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    border: '1px solid #f5c6cb'
  },
  formContainer: {
    backgroundColor: 'var(--bg-secondary)',
    padding: '30px',
    borderRadius: '10px',
    marginBottom: '30px',
    boxShadow: 'var(--box-shadow)',
    border: '1px solid var(--border-color)'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  label: {
    fontWeight: 'bold',
    color: 'var(--text-primary)'
  },
  input: {
    padding: '10px',
    border: '1px solid var(--border-color)',
    borderRadius: '5px',
    fontSize: '16px',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)'
  },
  select: {
    padding: '10px',
    border: '1px solid var(--border-color)',
    borderRadius: '5px',
    fontSize: '16px',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)'
  },
  textarea: {
    padding: '10px',
    border: '1px solid var(--border-color)',
    borderRadius: '5px',
    fontSize: '16px',
    resize: 'vertical',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)'
  },
  horariosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
    gap: '10px',
    marginTop: '10px'
  },
  horaButton: {
    padding: '10px',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    borderRadius: '5px',
    cursor: 'pointer',
    textAlign: 'center',
    color: 'var(--text-primary)'
  },
  horaButtonSelected: {
    backgroundColor: 'var(--color-patient)',
    color: 'white',
    border: 'none'
  },
  noHorarios: {
    color: 'var(--text-muted)',
    fontStyle: 'italic',
    marginTop: '10px'
  },
  submitButton: {
    backgroundColor: 'var(--color-patient)',
    color: 'white',
    padding: '15px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    marginTop: '20px'
  },
  citasContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px'
  },
  section: {
    backgroundColor: 'var(--bg-secondary)',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: 'var(--box-shadow)',
    border: '1px solid var(--border-color)'
  },
  emptyState: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    padding: '40px',
    fontStyle: 'italic'
  },
  citaCard: {
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    marginBottom: '15px',
    overflow: 'hidden',
    backgroundColor: 'var(--bg-tertiary)'
  },
  citaCardHistorial: {
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    marginBottom: '15px',
    overflow: 'hidden',
    opacity: 0.8,
    backgroundColor: 'var(--bg-tertiary)'
  },
  citaHeader: {
    backgroundColor: 'var(--bg-secondary)',
    padding: '10px 15px',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  citaDoctor: {
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    color: 'var(--text-primary)'
  },
  badge: {
    padding: '3px 8px',
    borderRadius: '3px',
    fontSize: '12px',
    textTransform: 'capitalize',
    color: 'white'
  },
  citaBody: {
    padding: '15px',
    color: 'var(--text-primary)'
  },
  citaFooter: {
    padding: '10px 15px',
    borderTop: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'flex-end'
  },
  cancelButton: {
    backgroundColor: 'var(--color-cancelled)',
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
  loading: {
    textAlign: 'center',
    fontSize: '20px',
    marginTop: '50px',
    color: 'var(--color-patient)'
  },
  loadingSmall: {
    textAlign: 'center',
    padding: '10px',
    color: 'var(--text-muted)'
  }
}

export default Citas