import React, { useEffect, useState } from 'react'
import axiosInstance from '../services/auth'
import { useNavigate } from 'react-router-dom'
import { 
  FaUsers, FaUserMd, FaUserNurse, FaCalendarAlt, 
  FaChartBar, FaStethoscope, FaClock, FaPlus, 
  FaEdit, FaTrash, FaEye, FaCheck, FaTimes, FaSpinner,
  FaExclamationTriangle, FaSync
} from 'react-icons/fa'

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [usuarios, setUsuarios] = useState([])
  const [doctores, setDoctores] = useState([])
  const [enfermeras, setEnfermeras] = useState([])
  const [citas, setCitas] = useState([])
  const [especialidades, setEspecialidades] = useState([])
  const [horarios, setHorarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingError, setLoadingError] = useState(null)
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalDoctores: 0,
    totalEnfermeras: 0,
    totalPacientes: 0,
    citasHoy: 0,
    citasPendientes: 0,
    citasTotales: 0
  })
  const [selectedItem, setSelectedItem] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [formData, setFormData] = useState({})
  const [saving, setSaving] = useState(false)
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' })
  const navigate = useNavigate()

  useEffect(() => {
    checkAdminAndLoadData()
  }, [])

  const checkAdminAndLoadData = async () => {
    setLoading(true)
    setLoadingError(null)
    
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        navigate('/login')
        return
      }

      const userResponse = await axiosInstance.get('usuario-actual/')
      
      if (userResponse.data.rol !== 'admin') {
        mostrarMensaje('Acceso no autorizado', 'error')
        setTimeout(() => navigate('/dashboard'), 2000)
        return
      }

      await loadAllData()
    } catch (error) {
      console.error('Error verificando admin:', error)
      setLoadingError('Error de autenticación. Por favor inicia sesión nuevamente.')
      setTimeout(() => navigate('/login'), 3000)
    }
  }

  const loadAllData = async () => {
    setLoading(true)
    setLoadingError(null)
    
    try {
      // Cargar todos los datos en paralelo
      const [
        usuariosRes,
        doctoresRes,
        enfermerasRes,
        citasRes,
        especialidadesRes,
        horariosRes
      ] = await Promise.allSettled([
        axiosInstance.get('usuarios/'),
        axiosInstance.get('doctores/'),
        axiosInstance.get('enfermeras/'),
        axiosInstance.get('citas/'),
        axiosInstance.get('especialidades/'),
        axiosInstance.get('horarios/')
      ])

      // Procesar cada respuesta
      if (usuariosRes.status === 'fulfilled') {
        setUsuarios(Array.isArray(usuariosRes.value.data) ? usuariosRes.value.data : [])
      } else {
        console.error('Error cargando usuarios:', usuariosRes.reason)
        setUsuarios([])
      }

      if (doctoresRes.status === 'fulfilled') {
        setDoctores(Array.isArray(doctoresRes.value.data) ? doctoresRes.value.data : [])
      } else {
        console.error('Error cargando doctores:', doctoresRes.reason)
        setDoctores([])
      }

      if (enfermerasRes.status === 'fulfilled') {
        setEnfermeras(Array.isArray(enfermerasRes.value.data) ? enfermerasRes.value.data : [])
      } else {
        console.error('Error cargando enfermeras:', enfermerasRes.reason)
        setEnfermeras([])
      }

      if (citasRes.status === 'fulfilled') {
        setCitas(Array.isArray(citasRes.value.data) ? citasRes.value.data : [])
      } else {
        console.error('Error cargando citas:', citasRes.reason)
        setCitas([])
      }

      if (especialidadesRes.status === 'fulfilled') {
        setEspecialidades(Array.isArray(especialidadesRes.value.data) ? especialidadesRes.value.data : [])
      } else {
        console.error('Error cargando especialidades:', especialidadesRes.reason)
        setEspecialidades([])
      }

      if (horariosRes.status === 'fulfilled') {
        setHorarios(Array.isArray(horariosRes.value.data) ? horariosRes.value.data : [])
      } else {
        console.error('Error cargando horarios:', horariosRes.reason)
        setHorarios([])
      }

      // Calcular estadísticas
      calcularEstadisticas(
        usuariosRes.status === 'fulfilled' ? usuariosRes.value.data : [],
        doctoresRes.status === 'fulfilled' ? doctoresRes.value.data : [],
        enfermerasRes.status === 'fulfilled' ? enfermerasRes.value.data : [],
        citasRes.status === 'fulfilled' ? citasRes.value.data : []
      )

    } catch (error) {
      console.error('Error general cargando datos:', error)
      setLoadingError('Error al cargar los datos. Intenta recargar la página.')
      mostrarMensaje('Error al cargar los datos', 'error')
    } finally {
      setLoading(false)
    }
  }

  const calcularEstadisticas = (usuarios, doctores, enfermeras, citas) => {
    const hoy = new Date().toISOString().split('T')[0]
    const citasArray = Array.isArray(citas) ? citas : []
    const usuariosArray = Array.isArray(usuarios) ? usuarios : []
    
    const citasHoy = citasArray.filter(c => c.fecha === hoy).length
    const citasPendientes = citasArray.filter(c => c.estado === 'pendiente').length
    const pacientes = usuariosArray.filter(u => u.rol === 'patient').length
    
    setStats({
      totalUsuarios: usuariosArray.length,
      totalDoctores: doctores.length,
      totalEnfermeras: enfermeras.length,
      totalPacientes: pacientes,
      citasHoy,
      citasPendientes,
      citasTotales: citasArray.length
    })
  }

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 5000)
  }

  const handleCreate = (tipo) => {
    setModalMode('create')
    setFormData({ tipo, rol: 'patient' })
    setShowModal(true)
  }

  const handleEdit = (item, tipo) => {
    setModalMode('edit')
    setSelectedItem(item)
    setFormData({ ...item, tipo })
    setShowModal(true)
  }

  const handleView = (item, tipo) => {
    setModalMode('view')
    setSelectedItem(item)
    setFormData({ ...item, tipo })
    setShowModal(true)
  }

  const handleDelete = async (tipo, id) => {
    if (!window.confirm(`¿Estás seguro de eliminar este ${tipo}?`)) return

    try {
      await axiosInstance.delete(`${tipo}/${id}/`)
      mostrarMensaje(`${tipo} eliminado correctamente`, 'success')
      loadAllData()
    } catch (error) {
      console.error('Error eliminando:', error)
      mostrarMensaje(`Error al eliminar ${tipo}`, 'error')
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const tipo = formData.tipo
      let response

      if (modalMode === 'create') {
        response = await axiosInstance.post(`${tipo}/`, formData)
        mostrarMensaje(`${tipo} creado correctamente`, 'success')
      } else if (modalMode === 'edit') {
        response = await axiosInstance.put(`${tipo}/${selectedItem.id}/`, formData)
        mostrarMensaje(`${tipo} actualizado correctamente`, 'success')
      }
      
      setShowModal(false)
      await loadAllData()
    } catch (error) {
      console.error('Error guardando:', error)
      mostrarMensaje(error.response?.data?.message || 'Error al guardar los datos', 'error')
    } finally {
      setSaving(false)
    }
  }

  const getEstadoBadge = (estado) => {
    const colores = {
      pendiente: '#f39c12',
      confirmada: '#27ae60',
      completada: '#3498db',
      cancelada: '#e74c3c',
      no_asistio: '#95a5a6'
    }
    return (
      <span style={{
        ...styles.badge,
        backgroundColor: colores[estado] || '#95a5a6',
        color: 'white'
      }}>
        {estado}
      </span>
    )
  }

  const getRolBadge = (rol) => {
    const colores = {
      admin: '#e74c3c',
      doctor: '#3498db',
      nurse: '#27ae60',
      patient: '#95a5a6'
    }
    return (
      <span style={{
        ...styles.rolBadge,
        backgroundColor: colores[rol] || '#95a5a6'
      }}>
        {rol}
      </span>
    )
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <FaSpinner style={styles.loadingSpinner} />
        <p style={styles.loadingText}>Cargando panel de administración...</p>
        <p style={styles.loadingSubtext}>Cargando usuarios, doctores, citas...</p>
      </div>
    )
  }

  if (loadingError) {
    return (
      <div style={styles.errorContainer}>
        <FaExclamationTriangle style={styles.errorIcon} />
        <h2 style={styles.errorTitle}>Error</h2>
        <p style={styles.errorMessage}>{loadingError}</p>
        <button onClick={() => window.location.reload()} style={styles.retryButton}>
          <FaSync /> Reintentar
        </button>
        <button onClick={() => navigate('/dashboard')} style={styles.backButton}>
          ← Volver al Dashboard
        </button>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>
            ⚙️ Panel de Administración
          </h1>
          <p style={styles.subtitle}>
            Gestiona todos los aspectos del sistema
          </p>
        </div>
        <button onClick={() => navigate('/dashboard')} style={styles.backButton}>
          ← Volver al Dashboard
        </button>
      </div>

      {/* Mensajes */}
      {mensaje.texto && (
        <div style={mensaje.tipo === 'success' ? styles.successMessage : styles.errorMessage}>
          {mensaje.tipo === 'success' ? <FaCheck /> : <FaExclamationTriangle />}
          <span style={styles.messageText}>{mensaje.texto}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <FaUsers style={styles.statIcon} />
          <div>
            <h3>Total Usuarios</h3>
            <p>{stats.totalUsuarios}</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <FaUserMd style={styles.statIcon} />
          <div>
            <h3>Doctores</h3>
            <p>{stats.totalDoctores}</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <FaUserNurse style={styles.statIcon} />
          <div>
            <h3>Enfermeras</h3>
            <p>{stats.totalEnfermeras}</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <FaCalendarAlt style={styles.statIcon} />
          <div>
            <h3>Citas Hoy</h3>
            <p>{stats.citasHoy}</p>
          </div>
        </div>
      </div>

      {/* Tabs de navegación */}
      <div style={styles.tabs}>
        <button
          style={{...styles.tab, ...(activeTab === 'dashboard' && styles.activeTab)}}
          onClick={() => setActiveTab('dashboard')}
        >
          <FaChartBar /> Dashboard
        </button>
        <button
          style={{...styles.tab, ...(activeTab === 'usuarios' && styles.activeTab)}}
          onClick={() => setActiveTab('usuarios')}
        >
          <FaUsers /> Usuarios ({stats.totalUsuarios})
        </button>
        <button
          style={{...styles.tab, ...(activeTab === 'doctores' && styles.activeTab)}}
          onClick={() => setActiveTab('doctores')}
        >
          <FaUserMd /> Doctores ({stats.totalDoctores})
        </button>
        <button
          style={{...styles.tab, ...(activeTab === 'enfermeras' && styles.activeTab)}}
          onClick={() => setActiveTab('enfermeras')}
        >
          <FaUserNurse /> Enfermeras ({stats.totalEnfermeras})
        </button>
        <button
          style={{...styles.tab, ...(activeTab === 'citas' && styles.activeTab)}}
          onClick={() => setActiveTab('citas')}
        >
          <FaCalendarAlt /> Citas ({stats.citasTotales})
        </button>
        <button
          style={{...styles.tab, ...(activeTab === 'especialidades' && styles.activeTab)}}
          onClick={() => setActiveTab('especialidades')}
        >
          <FaStethoscope /> Especialidades ({especialidades.length})
        </button>
        <button
          style={{...styles.tab, ...(activeTab === 'horarios' && styles.activeTab)}}
          onClick={() => setActiveTab('horarios')}
        >
          <FaClock /> Horarios ({horarios.length})
        </button>
      </div>

      {/* Contenido según tab activo */}
      <div style={styles.content}>
        {/* Tab: Dashboard */}
        {activeTab === 'dashboard' && (
          <div>
            <h2 style={styles.sectionTitle}>Resumen General</h2>
            <div style={styles.dashboardGrid}>
              <div style={styles.dashboardCard}>
                <h4>Usuarios por Rol</h4>
                <div style={styles.statsList}>
                  <div><span>Administradores:</span> <strong>{usuarios.filter(u => u.rol === 'admin').length}</strong></div>
                  <div><span>Doctores:</span> <strong>{stats.totalDoctores}</strong></div>
                  <div><span>Enfermeras:</span> <strong>{stats.totalEnfermeras}</strong></div>
                  <div><span>Pacientes:</span> <strong>{stats.totalPacientes}</strong></div>
                </div>
              </div>
              <div style={styles.dashboardCard}>
                <h4>Citas</h4>
                <div style={styles.statsList}>
                  <div><span>Hoy:</span> <strong>{stats.citasHoy}</strong></div>
                  <div><span>Pendientes:</span> <strong>{stats.citasPendientes}</strong></div>
                  <div><span>Totales:</span> <strong>{stats.citasTotales}</strong></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Usuarios */}
        {activeTab === 'usuarios' && (
          <div>
            <div style={styles.tableHeader}>
              <h2 style={styles.sectionTitle}>Gestión de Usuarios</h2>
              <button onClick={() => handleCreate('usuarios')} style={styles.createButton}>
                <FaPlus /> Nuevo Usuario
              </button>
            </div>
            {usuarios.length === 0 ? (
              <div style={styles.emptyState}>
                <p>No hay usuarios registrados</p>
              </div>
            ) : (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Usuario</th>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Rol</th>
                      <th>Teléfono</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map(user => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.username}</td>
                        <td>{user.first_name} {user.last_name}</td>
                        <td>{user.email}</td>
                        <td>{getRolBadge(user.rol)}</td>
                        <td>{user.telefono || '-'}</td>
                        <td style={styles.actions}>
                          <button onClick={() => handleView(user, 'usuarios')} style={styles.viewButton} title="Ver">
                            <FaEye />
                          </button>
                          <button onClick={() => handleEdit(user, 'usuarios')} style={styles.editButton} title="Editar">
                            <FaEdit />
                          </button>
                          <button onClick={() => handleDelete('usuarios', user.id)} style={styles.deleteButton} title="Eliminar">
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab: Doctores */}
        {activeTab === 'doctores' && (
          <div>
            <div style={styles.tableHeader}>
              <h2 style={styles.sectionTitle}>Gestión de Doctores</h2>
              <button onClick={() => handleCreate('doctores')} style={styles.createButton}>
                <FaPlus /> Nuevo Doctor
              </button>
            </div>
            {doctores.length === 0 ? (
              <div style={styles.emptyState}>
                <p>No hay doctores registrados</p>
              </div>
            ) : (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Especialidad</th>
                      <th>Nº Colegiado</th>
                      <th>Email</th>
                      <th>Teléfono</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctores.map(doctor => (
                      <tr key={doctor.id}>
                        <td>{doctor.id}</td>
                        <td>Dr. {doctor.usuario?.first_name} {doctor.usuario?.last_name}</td>
                        <td>{doctor.especialidad || '-'}</td>
                        <td>{doctor.numero_colegiado || '-'}</td>
                        <td>{doctor.usuario?.email || '-'}</td>
                        <td>{doctor.usuario?.telefono || '-'}</td>
                        <td style={styles.actions}>
                          <button onClick={() => handleView(doctor, 'doctores')} style={styles.viewButton} title="Ver">
                            <FaEye />
                          </button>
                          <button onClick={() => handleEdit(doctor, 'doctores')} style={styles.editButton} title="Editar">
                            <FaEdit />
                          </button>
                          <button onClick={() => handleDelete('doctores', doctor.id)} style={styles.deleteButton} title="Eliminar">
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab: Enfermeras */}
        {activeTab === 'enfermeras' && (
          <div>
            <div style={styles.tableHeader}>
              <h2 style={styles.sectionTitle}>Gestión de Enfermeras</h2>
              <button onClick={() => handleCreate('enfermeras')} style={styles.createButton}>
                <FaPlus /> Nueva Enfermera
              </button>
            </div>
            {enfermeras.length === 0 ? (
              <div style={styles.emptyState}>
                <p>No hay enfermeras registradas</p>
              </div>
            ) : (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Especialidad</th>
                      <th>Nº Licencia</th>
                      <th>Email</th>
                      <th>Teléfono</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enfermeras.map(enfermera => (
                      <tr key={enfermera.id}>
                        <td>{enfermera.id}</td>
                        <td>Enf. {enfermera.usuario?.first_name} {enfermera.usuario?.last_name}</td>
                        <td>{enfermera.especialidad_enfermeria || 'General'}</td>
                        <td>{enfermera.numero_licencia || '-'}</td>
                        <td>{enfermera.usuario?.email || '-'}</td>
                        <td>{enfermera.usuario?.telefono || '-'}</td>
                        <td style={styles.actions}>
                          <button onClick={() => handleView(enfermera, 'enfermeras')} style={styles.viewButton} title="Ver">
                            <FaEye />
                          </button>
                          <button onClick={() => handleEdit(enfermera, 'enfermeras')} style={styles.editButton} title="Editar">
                            <FaEdit />
                          </button>
                          <button onClick={() => handleDelete('enfermeras', enfermera.id)} style={styles.deleteButton} title="Eliminar">
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab: Citas */}
        {activeTab === 'citas' && (
          <div>
            <div style={styles.tableHeader}>
              <h2 style={styles.sectionTitle}>Gestión de Citas</h2>
            </div>
            {citas.length === 0 ? (
              <div style={styles.emptyState}>
                <p>No hay citas registradas</p>
              </div>
            ) : (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Paciente</th>
                      <th>Doctor</th>
                      <th>Fecha</th>
                      <th>Hora</th>
                      <th>Estado</th>
                      <th>Motivo</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {citas.map(cita => (
                      <tr key={cita.id}>
                        <td>{cita.id}</td>
                        <td>{cita.paciente_nombre || `ID: ${cita.paciente}`}</td>
                        <td>{cita.doctor_nombre || `ID: ${cita.doctor}`}</td>
                        <td>{cita.fecha}</td>
                        <td>{cita.hora}</td>
                        <td>{getEstadoBadge(cita.estado)}</td>
                        <td>{cita.motivo ? cita.motivo.substring(0, 30) + '...' : '-'}</td>
                        <td style={styles.actions}>
                          <button onClick={() => handleView(cita, 'citas')} style={styles.viewButton} title="Ver">
                            <FaEye />
                          </button>
                          <button onClick={() => handleEdit(cita, 'citas')} style={styles.editButton} title="Editar">
                            <FaEdit />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab: Especialidades */}
        {activeTab === 'especialidades' && (
          <div>
            <div style={styles.tableHeader}>
              <h2 style={styles.sectionTitle}>Gestión de Especialidades</h2>
              <button onClick={() => handleCreate('especialidades')} style={styles.createButton}>
                <FaPlus /> Nueva Especialidad
              </button>
            </div>
            {especialidades.length === 0 ? (
              <div style={styles.emptyState}>
                <p>No hay especialidades registradas</p>
              </div>
            ) : (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Descripción</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {especialidades.map(esp => (
                      <tr key={esp.id}>
                        <td>{esp.id}</td>
                        <td>{esp.nombre}</td>
                        <td>{esp.descripcion || '-'}</td>
                        <td style={styles.actions}>
                          <button onClick={() => handleView(esp, 'especialidades')} style={styles.viewButton} title="Ver">
                            <FaEye />
                          </button>
                          <button onClick={() => handleEdit(esp, 'especialidades')} style={styles.editButton} title="Editar">
                            <FaEdit />
                          </button>
                          <button onClick={() => handleDelete('especialidades', esp.id)} style={styles.deleteButton} title="Eliminar">
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab: Horarios */}
        {activeTab === 'horarios' && (
          <div>
            <div style={styles.tableHeader}>
              <h2 style={styles.sectionTitle}>Gestión de Horarios</h2>
              <button onClick={() => handleCreate('horarios')} style={styles.createButton}>
                <FaPlus /> Nuevo Horario
              </button>
            </div>
            {horarios.length === 0 ? (
              <div style={styles.emptyState}>
                <p>No hay horarios registrados</p>
              </div>
            ) : (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Doctor</th>
                      <th>Día</th>
                      <th>Hora Inicio</th>
                      <th>Hora Fin</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {horarios.map(horario => {
                      const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
                      return (
                        <tr key={horario.id}>
                          <td>{horario.id}</td>
                          <td>{horario.doctor_nombre || `ID: ${horario.doctor}`}</td>
                          <td>{dias[horario.dia_semana]}</td>
                          <td>{horario.hora_inicio}</td>
                          <td>{horario.hora_fin}</td>
                          <td>
                            <span style={{
                              ...styles.badge,
                              backgroundColor: horario.activo ? '#27ae60' : '#e74c3c'
                            }}>
                              {horario.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td style={styles.actions}>
                            <button onClick={() => handleView(horario, 'horarios')} style={styles.viewButton} title="Ver">
                              <FaEye />
                            </button>
                            <button onClick={() => handleEdit(horario, 'horarios')} style={styles.editButton} title="Editar">
                              <FaEdit />
                            </button>
                            <button onClick={() => handleDelete('horarios', horario.id)} style={styles.deleteButton} title="Eliminar">
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal para crear/editar/ver */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>
              {modalMode === 'create' && `Crear ${formData.tipo}`}
              {modalMode === 'edit' && `Editar ${formData.tipo}`}
              {modalMode === 'view' && `Ver ${formData.tipo}`}
            </h2>
            
            <form onSubmit={handleSubmit}>
              {/* Campos según el tipo */}
              {formData.tipo === 'usuarios' && (
                <>
                  <div style={styles.formGroup}>
                    <label>Username:</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username || ''}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      style={styles.input}
                      required
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label>Nombre:</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name || ''}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label>Apellido:</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name || ''}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label>Email:</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label>Teléfono:</label>
                    <input
                      type="text"
                      name="telefono"
                      value={formData.telefono || ''}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label>Rol:</label>
                    <select
                      name="rol"
                      value={formData.rol || 'patient'}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      style={styles.select}
                    >
                      <option value="patient">Paciente</option>
                      <option value="doctor">Doctor</option>
                      <option value="nurse">Enfermera</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                  {modalMode === 'create' && (
                    <div style={styles.formGroup}>
                      <label>Contraseña:</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password || ''}
                        onChange={handleInputChange}
                        style={styles.input}
                        required
                      />
                    </div>
                  )}
                </>
              )}

              {modalMode !== 'view' && (
                <div style={styles.modalButtons}>
                  <button 
                    type="submit" 
                    style={styles.saveButton}
                    disabled={saving}
                  >
                    {saving ? <FaSpinner style={styles.spinner} /> : <FaCheck />}
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)} 
                    style={styles.cancelButton}
                    disabled={saving}
                  >
                    <FaTimes /> Cancelar
                  </button>
                </div>
              )}
              {modalMode === 'view' && (
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  style={styles.closeButton}
                >
                  Cerrar
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// Estilos 
const styles = {
  container: {
    padding: '20px',
    maxWidth: '1400px',
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
    color: 'var(--color-admin)',
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
  retryButton: {
    backgroundColor: 'var(--color-admin)',
    color: 'white',
    padding: '12px 30px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px'
  },
  backButton: {
    backgroundColor: 'var(--text-muted)',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    marginTop: '10px'
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
    margin: 0
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    margin: 0
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
    transition: 'transform 0.2s',
    color: 'var(--text-primary)'
  },
  statIcon: {
    fontSize: '32px',
    color: 'var(--color-admin)'
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
    backgroundColor: 'var(--color-admin)',
    color: 'white',
    borderColor: 'var(--color-admin)'
  },
  content: {
    backgroundColor: 'var(--bg-secondary)',
    padding: '25px',
    borderRadius: '15px',
    boxShadow: 'var(--box-shadow)',
    border: '1px solid var(--border-color)',
    minHeight: '400px'
  },
  sectionTitle: {
    fontSize: '20px',
    color: 'var(--text-primary)',
    margin: '0 0 20px 0'
  },
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px'
  },
  dashboardCard: {
    backgroundColor: 'var(--bg-tertiary)',
    padding: '20px',
    borderRadius: '10px',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)'
  },
  statsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '15px'
  },
  tableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  createButton: {
    backgroundColor: 'var(--color-admin)',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500'
  },
  tableContainer: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
    color: 'var(--text-primary)'
  },
  actions: {
    display: 'flex',
    gap: '5px',
    justifyContent: 'center'
  },
  viewButton: {
    backgroundColor: 'var(--color-patient)',
    color: 'white',
    padding: '5px 8px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  editButton: {
    backgroundColor: '#f39c12',
    color: 'white',
    padding: '5px 8px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    color: 'white',
    padding: '5px 8px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  badge: {
    padding: '3px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '500',
    display: 'inline-block',
    color: 'white'
  },
  rolBadge: {
    padding: '3px 8px',
    borderRadius: '12px',
    color: 'white',
    fontSize: '11px',
    fontWeight: '500',
    display: 'inline-block',
    textTransform: 'capitalize'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: 'var(--text-muted)',
    backgroundColor: 'var(--bg-tertiary)',
    borderRadius: '8px',
    border: '1px solid var(--border-color)'
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
    maxWidth: '500px',
    width: '90%',
    maxHeight: '80vh',
    overflowY: 'auto',
    border: '1px solid var(--border-color)'
  },
  modalTitle: {
    fontSize: '20px',
    color: 'var(--text-primary)',
    marginBottom: '20px',
    paddingBottom: '10px',
    borderBottom: '1px solid var(--border-color)'
  },
  formGroup: {
    marginBottom: '15px',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-primary)'
  },
  input: {
    padding: '10px',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)'
  },
  select: {
    padding: '10px',
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
    padding: '12px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    flex: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
    fontSize: '14px',
    fontWeight: '500'
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
    color: 'white',
    padding: '12px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
    fontSize: '14px',
    fontWeight: '500'
  },
  closeButton: {
    backgroundColor: 'var(--text-muted)',
    color: 'white',
    padding: '12px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    width: '100%',
    fontSize: '14px',
    fontWeight: '500'
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

export default AdminDashboard