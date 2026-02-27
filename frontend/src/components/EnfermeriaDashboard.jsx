import React, { useEffect, useState } from 'react'
import axiosInstance from '../services/auth'
import { useNavigate } from 'react-router-dom'
import { 
  FaUserNurse, FaHeartbeat, FaThermometerHalf, FaSyringe, 
  FaBandAid, FaFlask, FaClipboardList, FaCheckCircle,
  FaExclamationTriangle, FaSpinner, FaCalendarAlt, FaUserMd,
  FaNotesMedical, FaVial, FaPills, FaWeight, FaRuler
} from 'react-icons/fa'

function EnfermeriaDashboard() {
  const [user, setUser] = useState(null)
  const [enfermera, setEnfermera] = useState(null)
  const [pacientesHoy, setPacientesHoy] = useState([])
  const [procedimientosPendientes, setProcedimientosPendientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState('Cargando panel de enfermería...')
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' })
  const [activeTab, setActiveTab] = useState('pacientes')
  const [selectedPaciente, setSelectedPaciente] = useState(null)
  const [signosVitales, setSignosVitales] = useState({
    temperatura: '',
    presion_sistolica: '',
    presion_diastolica: '',
    frecuencia_cardiaca: '',
    frecuencia_respiratoria: '',
    saturacion_oxigeno: '',
    peso: '',
    talla: '',
    glucosa: '',
    notas: ''
  })
  const [procedimiento, setProcedimiento] = useState({
    tipo: 'curacion',
    descripcion: '',
    materiales: '',
    observaciones: ''
  })
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    checkAccessAndLoadData()
  }, [])

  const checkAccessAndLoadData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        navigate('/login')
        return
      }

      // Obtener usuario actual
      const userResponse = await axiosInstance.get('usuario-actual/')
      
      // Verificar que sea enfermera
      if (userResponse.data.rol !== 'nurse') {
        mostrarMensaje('Acceso no autorizado', 'error')
        setTimeout(() => navigate('/dashboard'), 2000)
        return
      }

      setUser(userResponse.data)
      
      // Obtener perfil de enfermera
      const enfermerasResponse = await axiosInstance.get('enfermeras/')
      const enfermerasData = Array.isArray(enfermerasResponse.data) ? enfermerasResponse.data : []
      const miPerfil = enfermerasData.find(e => e.usuario?.id === userResponse.data.id)
      
      if (miPerfil) {
        setEnfermera(miPerfil)
      }

      // Cargar datos del día
      await loadTodayData()

    } catch (error) {
      console.error('Error cargando datos:', error)
      mostrarMensaje('Error al cargar el panel', 'error')
    } finally {
      setLoading(false)
    }
  }

  const loadTodayData = async () => {
    try {
      setLoadingMessage('Cargando pacientes del día...')
      
      // Obtener citas de hoy
      const hoy = new Date().toISOString().split('T')[0]
      const citasResponse = await axiosInstance.get('citas/', {
        params: { fecha: hoy }
      })
      
      const citasHoy = Array.isArray(citasResponse.data) ? citasResponse.data : []
      
      // Obtener detalles de pacientes
      const pacientesPromises = citasHoy.map(async (cita) => {
        try {
          const pacienteResponse = await axiosInstance.get(`pacientes/${cita.paciente}/`)
          return {
            ...cita,
            pacienteDetalle: pacienteResponse.data
          }
        } catch {
          return cita
        }
      })
      
      const pacientesConDetalle = await Promise.all(pacientesPromises)
      setPacientesHoy(pacientesConDetalle)

      // Simular procedimientos pendientes (esto debería venir de un endpoint real)
      setProcedimientosPendientes([
        { id: 1, tipo: 'vacuna', paciente: 'María González', descripcion: 'Vacuna contra influenza', prioridad: 'alta' },
        { id: 2, tipo: 'curacion', paciente: 'Juan Pérez', descripcion: 'Curación de herida post-operatoria', prioridad: 'media' },
        { id: 3, tipo: 'toma_muestra', paciente: 'Ana López', descripcion: 'Toma de muestra para análisis', prioridad: 'baja' }
      ])

    } catch (error) {
      console.error('Error cargando datos del día:', error)
    }
  }

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 5000)
  }

  const handleSignosVitalesChange = (e) => {
    const { name, value } = e.target
    setSignosVitales(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleProcedimientoChange = (e) => {
    const { name, value } = e.target
    setProcedimiento(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const registrarSignosVitales = async (pacienteId) => {
    setSaving(true)
    try {
      // Aquí iría la llamada a la API
      console.log('Registrando signos vitales:', { pacienteId, ...signosVitales })
      
      mostrarMensaje('✅ Signos vitales registrados correctamente', 'success')
      setSignosVitales({
        temperatura: '',
        presion_sistolica: '',
        presion_diastolica: '',
        frecuencia_cardiaca: '',
        frecuencia_respiratoria: '',
        saturacion_oxigeno: '',
        peso: '',
        talla: '',
        glucosa: '',
        notas: ''
      })
      setSelectedPaciente(null)
    } catch (error) {
      console.error('Error registrando signos vitales:', error)
      mostrarMensaje('Error al registrar signos vitales', 'error')
    } finally {
      setSaving(false)
    }
  }

  const realizarProcedimiento = async () => {
    setSaving(true)
    try {
      console.log('Realizando procedimiento:', procedimiento)
      mostrarMensaje('✅ Procedimiento registrado correctamente', 'success')
      setProcedimiento({
        tipo: 'curacion',
        descripcion: '',
        materiales: '',
        observaciones: ''
      })
    } catch (error) {
      console.error('Error realizando procedimiento:', error)
      mostrarMensaje('Error al registrar procedimiento', 'error')
    } finally {
      setSaving(false)
    }
  }

  const getPrioridadColor = (prioridad) => {
    const colores = {
      alta: '#e74c3c',
      media: '#f39c12',
      baja: '#27ae60'
    }
    return colores[prioridad] || '#95a5a6'
  }

  // Función para obtener el nombre de la especialidad de enfermería
  const getEspecialidadNombre = () => {
    if (!enfermera) return 'Enfermería General'
    
    if (enfermera.especialidad_nombre) {
      return enfermera.especialidad_nombre
    } else if (enfermera.otra_especialidad) {
      return `${enfermera.otra_especialidad}`
    }
    return 'Enfermería General'
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <FaSpinner style={styles.loadingSpinner} />
        <p style={styles.loadingText}>{loadingMessage}</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>
            <FaUserNurse style={styles.titleIcon} />
            Panel de Enfermería
          </h1>
          <p style={styles.subtitle}>
            Bienvenida, {user?.first_name} {user?.last_name}
            {enfermera && ` - ${getEspecialidadNombre()}`}
          </p>
          {enfermera?.numero_licencia && (
            <p style={styles.licenciaInfo}>
              <FaClipboardList /> Licencia: {enfermera.numero_licencia}
            </p>
          )}
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

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <FaUserNurse style={styles.statIcon} />
          <div>
            <h3>Pacientes Hoy</h3>
            <p>{pacientesHoy.length}</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <FaSyringe style={styles.statIcon} />
          <div>
            <h3>Procedimientos</h3>
            <p>{procedimientosPendientes.length}</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <FaHeartbeat style={styles.statIcon} />
          <div>
            <h3>Signos Vitales</h3>
            <p>Pendientes: {pacientesHoy.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={{...styles.tab, ...(activeTab === 'pacientes' && styles.activeTab)}}
          onClick={() => setActiveTab('pacientes')}
        >
          <FaUserNurse /> Pacientes del Día
        </button>
        <button
          style={{...styles.tab, ...(activeTab === 'procedimientos' && styles.activeTab)}}
          onClick={() => setActiveTab('procedimientos')}
        >
          <FaSyringe /> Procedimientos
        </button>
        <button
          style={{...styles.tab, ...(activeTab === 'registrar' && styles.activeTab)}}
          onClick={() => setActiveTab('registrar')}
        >
          <FaClipboardList /> Registrar Nuevo
        </button>
      </div>

      {/* Contenido según tab */}
      <div style={styles.content}>
        {/* Tab: Pacientes del Día */}
        {activeTab === 'pacientes' && (
          <div style={styles.pacientesContainer}>
            <h2>Pacientes con cita hoy</h2>
            {pacientesHoy.length === 0 ? (
              <div style={styles.emptyState}>
                <FaCalendarAlt style={styles.emptyIcon} />
                <p>No hay pacientes programados para hoy</p>
              </div>
            ) : (
              <div style={styles.pacientesList}>
                {pacientesHoy.map((cita, index) => (
                  <div key={cita.id || index} style={styles.pacienteCard}>
                    <div style={styles.pacienteHeader}>
                      <div>
                        <h3>{cita.paciente_nombre || `Paciente #${cita.paciente}`}</h3>
                        <p style={styles.pacienteHora}>{cita.hora}</p>
                      </div>
                      <span style={styles.pacienteEstado}>{cita.estado}</span>
                    </div>
                    
                    {cita.motivo && (
                      <p style={styles.pacienteMotivo}>
                        <FaNotesMedical /> {cita.motivo}
                      </p>
                    )}

                    <div style={styles.pacienteAcciones}>
                      <button 
                        style={styles.actionButton}
                        onClick={() => setSelectedPaciente(cita)}
                      >
                        <FaHeartbeat /> Registrar Signos
                      </button>
                      <button style={styles.actionButton}>
                        <FaBandAid /> Realizar Curación
                      </button>
                      <button style={styles.actionButton}>
                        <FaVial /> Tomar Muestra
                      </button>
                    </div>

                    {/* Modal de signos vitales */}
                    {selectedPaciente?.id === cita.id && (
                      <div style={styles.modalOverlay} onClick={() => setSelectedPaciente(null)}>
                        <div style={styles.modal} onClick={e => e.stopPropagation()}>
                          <h3>Registrar Signos Vitales</h3>
                          <p style={styles.modalPaciente}>
                            Paciente: {selectedPaciente?.paciente_nombre}
                          </p>
                          
                          <div style={styles.signosForm}>
                            <div style={styles.formRow}>
                              <div style={styles.formGroup}>
                                <label>Temperatura (°C):</label>
                                <input
                                  type="number"
                                  name="temperatura"
                                  value={signosVitales.temperatura}
                                  onChange={handleSignosVitalesChange}
                                  style={styles.input}
                                  placeholder="36.5"
                                  step="0.1"
                                />
                              </div>
                              <div style={styles.formGroup}>
                                <label>Presión Arterial:</label>
                                <div style={styles.presionGroup}>
                                  <input
                                    type="number"
                                    name="presion_sistolica"
                                    value={signosVitales.presion_sistolica}
                                    onChange={handleSignosVitalesChange}
                                    style={styles.inputSmall}
                                    placeholder="120"
                                  />
                                  <span>/</span>
                                  <input
                                    type="number"
                                    name="presion_diastolica"
                                    value={signosVitales.presion_diastolica}
                                    onChange={handleSignosVitalesChange}
                                    style={styles.inputSmall}
                                    placeholder="80"
                                  />
                                </div>
                              </div>
                            </div>

                            <div style={styles.formRow}>
                              <div style={styles.formGroup}>
                                <label>Frec. Cardíaca (lpm):</label>
                                <input
                                  type="number"
                                  name="frecuencia_cardiaca"
                                  value={signosVitales.frecuencia_cardiaca}
                                  onChange={handleSignosVitalesChange}
                                  style={styles.input}
                                  placeholder="72"
                                />
                              </div>
                              <div style={styles.formGroup}>
                                <label>Frec. Respiratoria:</label>
                                <input
                                  type="number"
                                  name="frecuencia_respiratoria"
                                  value={signosVitales.frecuencia_respiratoria}
                                  onChange={handleSignosVitalesChange}
                                  style={styles.input}
                                  placeholder="16"
                                />
                              </div>
                            </div>

                            <div style={styles.formRow}>
                              <div style={styles.formGroup}>
                                <label>Saturación O2 (%):</label>
                                <input
                                  type="number"
                                  name="saturacion_oxigeno"
                                  value={signosVitales.saturacion_oxigeno}
                                  onChange={handleSignosVitalesChange}
                                  style={styles.input}
                                  placeholder="98"
                                  min="0"
                                  max="100"
                                />
                              </div>
                              <div style={styles.formGroup}>
                                <label>Glucosa (mg/dL):</label>
                                <input
                                  type="number"
                                  name="glucosa"
                                  value={signosVitales.glucosa}
                                  onChange={handleSignosVitalesChange}
                                  style={styles.input}
                                  placeholder="100"
                                />
                              </div>
                            </div>

                            <div style={styles.formRow}>
                              <div style={styles.formGroup}>
                                <label>Peso (kg):</label>
                                <input
                                  type="number"
                                  name="peso"
                                  value={signosVitales.peso}
                                  onChange={handleSignosVitalesChange}
                                  style={styles.input}
                                  placeholder="70"
                                  step="0.1"
                                />
                              </div>
                              <div style={styles.formGroup}>
                                <label>Talla (cm):</label>
                                <input
                                  type="number"
                                  name="talla"
                                  value={signosVitales.talla}
                                  onChange={handleSignosVitalesChange}
                                  style={styles.input}
                                  placeholder="170"
                                />
                              </div>
                            </div>

                            <div style={styles.formGroup}>
                              <label>Notas adicionales:</label>
                              <textarea
                                name="notas"
                                value={signosVitales.notas}
                                onChange={handleSignosVitalesChange}
                                style={styles.textarea}
                                rows="3"
                                placeholder="Observaciones importantes..."
                              />
                            </div>

                            <div style={styles.modalButtons}>
                              <button 
                                onClick={() => registrarSignosVitales(selectedPaciente.paciente)}
                                style={styles.saveButton}
                                disabled={saving}
                              >
                                {saving ? <FaSpinner style={styles.spinner} /> : <FaCheckCircle />}
                                Guardar Signos Vitales
                              </button>
                              <button 
                                onClick={() => setSelectedPaciente(null)}
                                style={styles.cancelButton}
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Procedimientos Pendientes */}
        {activeTab === 'procedimientos' && (
          <div style={styles.procedimientosContainer}>
            <h2>Procedimientos Pendientes</h2>
            {procedimientosPendientes.length === 0 ? (
              <div style={styles.emptyState}>
                <FaCheckCircle style={styles.emptyIcon} />
                <p>No hay procedimientos pendientes</p>
              </div>
            ) : (
              <div style={styles.procedimientosList}>
                {procedimientosPendientes.map(proc => (
                  <div key={proc.id} style={styles.procedimientoCard}>
                    <div style={styles.procedimientoHeader}>
                      <div style={styles.procedimientoTipo}>
                        {proc.tipo === 'vacuna' && <FaSyringe />}
                        {proc.tipo === 'curacion' && <FaBandAid />}
                        {proc.tipo === 'toma_muestra' && <FaFlask />}
                        <span>{proc.tipo.charAt(0).toUpperCase() + proc.tipo.slice(1)}</span>
                      </div>
                      <span style={{
                        ...styles.prioridadBadge,
                        backgroundColor: getPrioridadColor(proc.prioridad)
                      }}>
                        {proc.prioridad}
                      </span>
                    </div>
                    
                    <p style={styles.procedimientoPaciente}>
                      <strong>Paciente:</strong> {proc.paciente}
                    </p>
                    <p style={styles.procedimientoDescripcion}>
                      {proc.descripcion}
                    </p>

                    <button style={styles.realizarButton}>
                      Realizar Procedimiento
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Registrar Nuevo */}
        {activeTab === 'registrar' && (
          <div style={styles.registrarContainer}>
            <h2>Registrar Nuevo Procedimiento</h2>
            
            <div style={styles.registrarForm}>
              <div style={styles.formGroup}>
                <label>Tipo de Procedimiento:</label>
                <select
                  name="tipo"
                  value={procedimiento.tipo}
                  onChange={handleProcedimientoChange}
                  style={styles.select}
                >
                  <option value="curacion">Curación</option>
                  <option value="vacuna">Vacunación</option>
                  <option value="toma_muestra">Toma de Muestra</option>
                  <option value="medicacion">Administración de Medicamentos</option>
                  <option value="control">Control de Signos Vitales</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label>Paciente:</label>
                <select style={styles.select}>
                  <option value="">Seleccionar paciente</option>
                  {pacientesHoy.map(cita => (
                    <option key={cita.id} value={cita.paciente}>
                      {cita.paciente_nombre} - {cita.hora}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label>Descripción:</label>
                <textarea
                  name="descripcion"
                  value={procedimiento.descripcion}
                  onChange={handleProcedimientoChange}
                  style={styles.textarea}
                  rows="3"
                  placeholder="Describe el procedimiento a realizar..."
                />
              </div>

              <div style={styles.formGroup}>
                <label>Materiales utilizados:</label>
                <textarea
                  name="materiales"
                  value={procedimiento.materiales}
                  onChange={handleProcedimientoChange}
                  style={styles.textarea}
                  rows="2"
                  placeholder="Ej: gasas, alcohol, jeringa..."
                />
              </div>

              <div style={styles.formGroup}>
                <label>Observaciones:</label>
                <textarea
                  name="observaciones"
                  value={procedimiento.observaciones}
                  onChange={handleProcedimientoChange}
                  style={styles.textarea}
                  rows="2"
                  placeholder="Notas adicionales..."
                />
              </div>

              <button 
                onClick={realizarProcedimiento}
                style={styles.realizarButton}
                disabled={saving}
              >
                {saving ? <FaSpinner style={styles.spinner} /> : <FaCheckCircle />}
                Registrar Procedimiento
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Estilos (se mantienen igual, solo añadimos un estilo nuevo para licenciaInfo)
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
    color: 'var(--color-nurse)',
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
    color: 'var(--color-nurse)'
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    margin: 0
  },
  licenciaInfo: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    margin: '5px 0 0 0',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    backgroundColor: 'var(--bg-secondary)',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: 'var(--box-shadow)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    color: 'var(--text-primary)'
  },
  statIcon: {
    fontSize: '32px',
    color: 'var(--color-nurse)'
  },
  tabs: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap'
  },
  tab: {
    padding: '12px 20px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-primary)',
    transition: 'all 0.3s'
  },
  activeTab: {
    backgroundColor: 'var(--color-nurse)',
    color: 'white',
    borderColor: 'var(--color-nurse)'
  },
  content: {
    backgroundColor: 'var(--bg-secondary)',
    padding: '25px',
    borderRadius: '15px',
    boxShadow: 'var(--box-shadow)',
    border: '1px solid var(--border-color)',
    minHeight: '400px'
  },
  pacientesContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  pacientesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  pacienteCard: {
    backgroundColor: 'var(--bg-tertiary)',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)'
  },
  pacienteHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  pacienteHora: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginTop: '5px'
  },
  pacienteEstado: {
    padding: '4px 8px',
    backgroundColor: 'var(--color-nurse)',
    color: 'white',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '500'
  },
  pacienteMotivo: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginBottom: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    backgroundColor: 'var(--bg-secondary)',
    padding: '8px',
    borderRadius: '6px'
  },
  pacienteAcciones: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  },
  actionButton: {
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    padding: '8px 12px',
    border: '1px solid var(--color-nurse)',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
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
    padding: '30px',
    borderRadius: '15px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '80vh',
    overflowY: 'auto',
    border: '1px solid var(--border-color)'
  },
  modalPaciente: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    marginBottom: '20px'
  },
  signosForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  input: {
    padding: '8px',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)'
  },
  inputSmall: {
    width: '70px',
    padding: '8px',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    fontSize: '14px',
    textAlign: 'center',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)'
  },
  presionGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  textarea: {
    padding: '8px',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    fontSize: '14px',
    resize: 'vertical',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)'
  },
  select: {
    padding: '8px',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)'
  },
  modalButtons: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px'
  },
  saveButton: {
    backgroundColor: '#27ae60',
    color: 'white',
    padding: '10px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    flex: 2,
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
    borderRadius: '6px',
    cursor: 'pointer',
    flex: 1
  },
  procedimientosContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  procedimientosList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '15px'
  },
  procedimientoCard: {
    backgroundColor: 'var(--bg-tertiary)',
    padding: '15px',
    borderRadius: '10px',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)'
  },
  procedimientoHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  procedimientoTipo: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontWeight: '600',
    color: 'var(--text-primary)'
  },
  prioridadBadge: {
    padding: '3px 8px',
    borderRadius: '12px',
    color: 'white',
    fontSize: '11px',
    fontWeight: '500',
    textTransform: 'uppercase'
  },
  procedimientoPaciente: {
    fontSize: '13px',
    marginBottom: '5px'
  },
  procedimientoDescripcion: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginBottom: '10px'
  },
  realizarButton: {
    backgroundColor: 'var(--color-nurse)',
    color: 'white',
    padding: '8px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px'
  },
  registrarContainer: {
    maxWidth: '600px',
    margin: '0 auto'
  },
  registrarForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: 'var(--text-muted)'
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '10px',
    color: 'var(--text-muted)'
  },
  spinner: {
    animation: 'spin 1s linear infinite'
  }
}

// Añadir animación de spin
const styleSheet = document.createElement("style")
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`
document.head.appendChild(styleSheet)

export default EnfermeriaDashboard