import React, { useEffect, useState } from 'react'
import axiosInstance from '../services/auth'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { 
  FaUsers, FaUserMd, FaUserNurse, FaCalendarAlt, 
  FaChartBar, FaStethoscope, FaClock, FaPlus, 
  FaEdit, FaTrash, FaEye, FaCheck, FaTimes, FaSpinner,
  FaExclamationTriangle, FaSync, FaSave, FaBan,
  FaEnvelope, FaPhone, FaIdCard, FaVenusMars, FaCalendarCheck,
  FaUserInjured
} from 'react-icons/fa'

function AdminDashboard() {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [usuarios, setUsuarios] = useState([])
  const [todosLosUsuarios, setTodosLosUsuarios] = useState([])
  const [doctores, setDoctores] = useState([])
  const [enfermeras, setEnfermeras] = useState([])
  const [pacientes, setPacientes] = useState([])
  const [citas, setCitas] = useState([])
  const [especialidades, setEspecialidades] = useState([])
  const [horarios, setHorarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingError, setLoadingError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [errorBackend, setErrorBackend] = useState('')
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalDoctores: 0,
    totalEnfermeras: 0,
    totalPacientes: 0,
    citasHoy: 0,
    citasPendientes: 0,
    citasTotales: 0
  })

  // Estados para el modal
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('create') // 'create', 'edit', 'view'
  const [selectedItem, setSelectedItem] = useState(null)
  const [formData, setFormData] = useState({})
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' })

  const navigate = useNavigate()
  const location = useLocation()

  // Leer parámetro tab de la URL y establecer activeTab
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const tabFromUrl = searchParams.get('tab')
    if (tabFromUrl && ['dashboard', 'usuarios', 'doctores', 'enfermeras', 'pacientes', 'citas', 'especialidades', 'horarios'].includes(tabFromUrl)) {
      console.log('🔄 Cambiando tab desde URL:', tabFromUrl)
      setActiveTab(tabFromUrl)
    }
  }, [location.search, navigate])

  // Cargar datos al iniciar
  useEffect(() => {
    checkAdminAndLoadData()
  }, [])

  // Verificar que el usuario es admin
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
        mostrarMensaje(t('unauthorized'), 'error')
        setTimeout(() => navigate('/dashboard'), 2000)
        return
      }

      await loadAllData()
    } catch (error) {
      console.error('Error verificando admin:', error)
      setLoadingError(t('sessionExpired'))
      setTimeout(() => navigate('/login'), 3000)
    }
  }

  // Cargar todos los datos
  const loadAllData = async () => {
    setLoading(true)
    setLoadingError(null)
  
  try {
    const [
      usuariosRes,
      doctoresRes,
      enfermerasRes,
      pacientesRes,
      citasRes,
      especialidadesRes,
      horariosRes
    ] = await Promise.allSettled([
      axiosInstance.get('usuarios/?limit=1000'),
      axiosInstance.get('doctores/?limit=1000'),
      axiosInstance.get('enfermeras/?limit=1000'),
      axiosInstance.get('pacientes/?limit=1000'),
      axiosInstance.get('citas/?limit=1000'),
      axiosInstance.get('especialidades/?limit=1000'),
      axiosInstance.get('horarios/?limit=1000')
    ])

    // Extraer datos de cada respuesta
    let usuariosData = []
    let doctoresData = []
    let enfermerasData = []
    let pacientesData = []
    let citasData = []
    let especialidadesData = []
    let horariosData = []

    // Total de usuarios por tipo (desde la paginación)
    let totalUsuariosAPI = 0
    let totalDoctoresAPI = 0
    let totalEnfermerasAPI = 0
    let totalPacientesAPI = 0

    // ✅ Usuarios (con paginación)
    if (usuariosRes.status === 'fulfilled') {
      const responseData = usuariosRes.value.data
      usuariosData = responseData.results || responseData || []
      totalUsuariosAPI = responseData.count || usuariosData.length
      console.log('👥 Usuarios cargados:', usuariosData.length, 'Total API:', totalUsuariosAPI)
    }

    // ✅ Doctores (con paginación)
    if (doctoresRes.status === 'fulfilled') {
      const responseData = doctoresRes.value.data
      doctoresData = responseData.results || responseData || []
      totalDoctoresAPI = responseData.count || doctoresData.length
      console.log('👨‍⚕️ Doctores cargados:', doctoresData.length, 'Total API:', totalDoctoresAPI)
    }

    // ✅ Enfermeras (con paginación)
    if (enfermerasRes.status === 'fulfilled') {
      const responseData = enfermerasRes.value.data
      enfermerasData = responseData.results || responseData || []
      totalEnfermerasAPI = responseData.count || enfermerasData.length
      console.log('👩‍⚕️ Enfermeras cargadas:', enfermerasData.length, 'Total API:', totalEnfermerasAPI)
    }

    // ✅ Pacientes (con paginación)
    if (pacientesRes.status === 'fulfilled') {
      const responseData = pacientesRes.value.data
      pacientesData = responseData.results || responseData || []
      totalPacientesAPI = responseData.count || pacientesData.length
      console.log('🏥 Pacientes cargados:', pacientesData.length, 'Total API:', totalPacientesAPI)
    }

    // ✅ Citas (con paginación)
    if (citasRes.status === 'fulfilled') {
      const responseData = citasRes.value.data
      citasData = responseData.results || responseData || []
      console.log('📅 Citas cargadas:', citasData.length)
    }

    // ✅ Especialidades (con paginación)
    if (especialidadesRes.status === 'fulfilled') {
      const responseData = especialidadesRes.value.data
      especialidadesData = responseData.results || responseData || []
      console.log('🔬 Especialidades cargadas:', especialidadesData.length)
    }

    // ✅ Horarios (con paginación)
    if (horariosRes.status === 'fulfilled') {
      const responseData = horariosRes.value.data
      horariosData = responseData.results || responseData || []
      console.log('⏰ Horarios cargados:', horariosData.length)
    }

    // Asignar datos al estado
    setUsuarios(usuariosData)
    setTodosLosUsuarios(usuariosData)
    setDoctores(doctoresData)
    setEnfermeras(enfermerasData)
    setPacientes(pacientesData)
    setCitas(citasData)
    setEspecialidades(especialidadesData)
    setHorarios(horariosData)

    // Crear lista combinada de todos los usuarios para la sección de gestión de usuarios
    // Filtrar duplicados: los doctores/enfermeras/pacientes también tienen entrada en usuarios
    const usuariosPorId = new Map()
    
    // Primero agregar usuarios base
    usuariosData.forEach(u => {
      usuariosPorId.set(u.id, { ...u, tipoUsuario: u.rol })
    })
    
    // Luego agregar sobrescribiendo solo si es un perfil específico (doctor/nurse/patient)
    // para evitar duplicados
    doctoresData.forEach(d => {
      const usuarioId = d.usuario?.id
      if (usuarioId) {
        usuariosPorId.set(usuarioId, { 
          id: usuarioId, 
          username: d.usuario?.username || '',
          first_name: d.usuario?.first_name || '',
          last_name: d.usuario?.last_name || '',
          email: d.usuario?.email || '',
          telefono: d.usuario?.telefono || '',
          rol: 'doctor',
          tipoUsuario: 'doctor'
        })
      }
    })
    
    enfermerasData.forEach(e => {
      const usuarioId = e.usuario?.id
      if (usuarioId) {
        usuariosPorId.set(usuarioId, { 
          id: usuarioId, 
          username: e.usuario?.username || '',
          first_name: e.usuario?.first_name || '',
          last_name: e.usuario?.last_name || '',
          email: e.usuario?.email || '',
          telefono: e.usuario?.telefono || '',
          rol: 'nurse',
          tipoUsuario: 'nurse'
        })
      }
    })
    
    pacientesData.forEach(p => {
      const usuarioId = p.usuario?.id
      if (usuarioId) {
        usuariosPorId.set(usuarioId, { 
          id: usuarioId, 
          username: p.usuario?.username || '',
          first_name: p.usuario?.first_name || '',
          last_name: p.usuario?.last_name || '',
          email: p.usuario?.email || '',
          telefono: p.usuario?.telefono || '',
          rol: 'patient',
          tipoUsuario: 'patient'
        })
      }
    })
    
    const todosUsuarios = Array.from(usuariosPorId.values())
    setTodosLosUsuarios(todosUsuarios)

    // Calcular estadísticas usando la longitud de la lista combinada
    const totalTodos = todosUsuarios.length
    setStats({
      totalUsuarios: totalTodos,
      totalDoctores: doctoresData.length,
      totalEnfermeras: enfermerasData.length,
      totalPacientes: pacientesData.length,
      citasHoy: citasData.filter(c => c.fecha === new Date().toISOString().split('T')[0]).length,
      citasPendientes: citasData.filter(c => c.estado === 'pendiente').length,
      citasTotales: citasData.length
    })

  } catch (error) {
    console.error('Error general:', error)
    setLoadingError('Error al cargar los datos')
  } finally {
    setLoading(false)
  }
}

  // Calcular estadísticas
  const calcularEstadisticas = (totalUsuariosAPI, totalDoctoresAPI, totalEnfermerasAPI, totalPacientesAPI, citas) => {
    const hoy = new Date().toISOString().split('T')[0]
    const citasArray = Array.isArray(citas) ? citas : []
    
    const citasHoy = citasArray.filter(c => c.fecha === hoy).length
    const citasPendientes = citasArray.filter(c => c.estado === 'pendiente').length
    
    const totalUsuarios = totalUsuariosAPI + totalDoctoresAPI + totalEnfermerasAPI + totalPacientesAPI
    
    setStats({
      totalUsuarios,
      totalDoctores: totalDoctoresAPI,
      totalEnfermeras: totalEnfermerasAPI,
      totalPacientes: totalPacientesAPI,
      citasHoy,
      citasPendientes,
      citasTotales: citasArray.length
    })
  }

  // Mostrar mensajes
  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 5000)
  }

  // ===== FUNCIONES CRUD =====

  // Abrir modal para crear
  const handleCreate = (tipo) => {
    console.log('Creando nuevo:', tipo)
    setModalMode('create')
    setSelectedItem(null)
    setErrorBackend('')
    
    // Inicializar formulario según el tipo
    const baseForm = { tipo }
    
    if (tipo === 'usuarios') {
      setFormData({
        ...baseForm,
        username: '',
        password: '',
        first_name: '',
        last_name: '',
        email: '',
        telefono: '',
        rol: 'patient'
      })
    } else if (tipo === 'doctores') {
      setFormData({
        ...baseForm,
        // Datos del usuario
        username: '',
        password: '',
        first_name: '',
        last_name: '',
        email: '',
        telefono: '',
        // Datos específicos de doctor
        especialidad: '',
        otra_especialidad: '',
        biografia: ''
      })
    } else if (tipo === 'enfermeras') {
      setFormData({
        ...baseForm,
        // Datos del usuario
        username: '',
        password: '',
        first_name: '',
        last_name: '',
        email: '',
        telefono: '',
        // Datos específicos de enfermera
        especialidad: '',
        otra_especialidad: '',
        numero_licencia: ''
      })
    } else if (tipo === 'pacientes') {
      setFormData({
        ...baseForm,
        // Datos del usuario
        username: '',
        password: '',
        first_name: '',
        last_name: '',
        email: '',
        telefono: '',
        fecha_nacimiento: '',
        // Datos médicos del paciente
        alergias: '',
        grupo_sanguineo: '',
        contacto_emergencia: '',
        telefono_emergencia: ''
      })
    } else if (tipo === 'especialidades') {
      setFormData({
        tipo: 'especialidades', 
        nombre: '',
        descripcion: '',
        tipo_especialidad: 'medica',
        activo: true
      })
    } else if (tipo === 'horarios') {
      setFormData({
        ...baseForm,
        doctor: '',
        dia_semana: 0,
        hora_inicio: '09:00',
        hora_fin: '17:00',
        activo: true
      })
    } else if (tipo === 'citas') {
      setFormData({
        ...baseForm,
        paciente: '',
        doctor: '',
        fecha: new Date().toISOString().split('T')[0],
        hora: '09:00',
        estado: 'pendiente',
        motivo: ''
      })
    }
    
    setShowModal(true)
  }

  // Abrir modal para editar
  const handleEdit = (item, tipo) => {
    console.log('Editando:', item, tipo)
    setModalMode('edit')
    setSelectedItem(item)
    setErrorBackend('')
    
    if (tipo === 'doctores') {
      setFormData({
        ...item,
        tipo,
        first_name: item.usuario?.first_name || '',
        last_name: item.usuario?.last_name || '',
        email: item.usuario?.email || '',
        telefono: item.usuario?.telefono || ''
      })
    } else if (tipo === 'enfermeras') {
      setFormData({
        ...item,
        tipo,
        first_name: item.usuario?.first_name || '',
        last_name: item.usuario?.last_name || '',
        email: item.usuario?.email || '',
        telefono: item.usuario?.telefono || ''
      })
    } else if (tipo === 'pacientes') {
      setFormData({
        ...item,
        tipo,
        alergias: item.alergias || '',
        grupo_sanguineo: item.grupo_sanguineo || '',
        contacto_emergencia: item.contacto_emergencia || '',
        telefono_emergencia: item.telefono_emergencia || '',
        fecha_nacimiento: item.usuario?.fecha_nacimiento || ''
      })
    } else {
      setFormData({ ...item, tipo })
    }
    
    setShowModal(true)
  }

  // Abrir modal para ver
  const handleView = (item, tipo) => {
    console.log('Viendo:', item, tipo)
    setModalMode('view')
    setSelectedItem(item)
    
    if (tipo === 'doctores') {
      setFormData({
        ...item,
        tipo,
        first_name: item.usuario?.first_name || '',
        last_name: item.usuario?.last_name || '',
        email: item.usuario?.email || '',
        telefono: item.usuario?.telefono || ''
      })
    } else if (tipo === 'enfermeras') {
      setFormData({
        ...item,
        tipo,
        first_name: item.usuario?.first_name || '',
        last_name: item.usuario?.last_name || '',
        email: item.usuario?.email || '',
        telefono: item.usuario?.telefono || ''
      })
    } else {
      setFormData({ ...item, tipo })
    }
    
    setShowModal(true)
  }

  // Eliminar elemento
  const handleDelete = async (tipo, id) => {
    if (!window.confirm(t('confirmDelete', { type: tipo }))) return

    try {
      setSaving(true)
      await axiosInstance.delete(`${tipo}/${id}/`)
      mostrarMensaje(`✅ ${t('itemDeleted', { type: tipo })}`, 'success')
      await loadAllData()
    } catch (error) {
      console.error('Error eliminando:', error)
      mostrarMensaje(error.response?.data?.message || t('errorDeleting', { type: tipo }), 'error')
    } finally {
      setSaving(false)
    }
  }

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    setErrorBackend('')
  }

  // Guardar (crear o actualizar)
  const handleSubmit = async (e) => {
  e.preventDefault()
  setSaving(true)
  setErrorBackend('')
  
  console.log('📤 Enviando formulario:', formData)
  
  // Validar campos requeridos para pacientes
  if (formData.tipo === 'pacientes') {
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      setErrorBackend('Por favor ingrese un email válido')
      mostrarMensaje('Por favor ingrese un email válido', 'error')
      setSaving(false)
      return
    }
    
    if (modalMode === 'create') {
      // En modo creación, validar campos requeridos del usuario
      if (!formData.username?.trim() || !formData.password?.trim() || !formData.first_name?.trim() || !formData.last_name?.trim()) {
        setErrorBackend('Por favor complete todos los campos requeridos (Username, Contraseña, Nombre, Apellido)')
        mostrarMensaje('Por favor complete todos los campos requeridos', 'error')
        setSaving(false)
        return
      }
      // Validar longitud mínima de contraseña
      if (formData.password.length < 8) {
        setErrorBackend('La contraseña debe tener al menos 8 caracteres')
        mostrarMensaje('La contraseña debe tener al menos 8 caracteres', 'error')
        setSaving(false)
        return
      }
    } else if (modalMode === 'edit') {
      // En modo edición, validar campos requeridos del usuario
      if (!formData.first_name?.trim() || !formData.last_name?.trim()) {
        setErrorBackend('Por favor complete todos los campos requeridos (Nombre, Apellido)')
        mostrarMensaje('Por favor complete todos los campos requeridos', 'error')
        setSaving(false)
        return
      }
    }
  }

  try {
    const tipo = formData.tipo

    if (modalMode === 'create') {
      if (tipo === 'doctores') {
        // Crear usuario primero
        const usuarioData = {
          username: formData.username,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email || '',
          telefono: formData.telefono || '',
          rol: 'doctor'
        }
        console.log('👉 Creando usuario:', usuarioData)
        
        const usuarioRes = await axiosInstance.post('usuarios/', usuarioData)
        const nuevoUsuario = usuarioRes.data
        console.log('✅ Usuario creado:', nuevoUsuario)
        
        // Crear perfil de doctor
        const doctorData = {
          usuario_id: nuevoUsuario.id,
          especialidad: formData.especialidad || '',
          otra_especialidad: formData.otra_especialidad || '',
          biografia: formData.biografia || ''
        }
        console.log('👉 Creando doctor:', doctorData)
        
        const doctorRes = await axiosInstance.post('doctores/', doctorData)
        console.log('Doctor creado:', doctorRes.data)
        
        // Si se usó "otra_especialidad" y no se seleccionó una de la lista, crear la nueva especialidad
        if (formData.otra_especialidad && !formData.especialidad) {
          try {
            const nuevaEsp = await axiosInstance.post('especialidades/', {
              nombre: formData.otra_especialidad,
              descripcion: `Especialidad médica creada automáticamente para Dr. ${nuevoUsuario.first_name} ${nuevoUsuario.last_name}`,
              tipo_especialidad: 'medica',
              activo: true
            })
            console.log('Nueva especialidad médica creada:', nuevaEsp.data)
            // Actualizar el doctor con la nueva especialidad
            await axiosInstance.patch(`doctores/${doctorRes.data.id}/`, {
              especialidad: nuevaEsp.data.id,
              otra_especialidad: ''
            })
          } catch (espError) {
            console.warn('No se pudo crear la especialidad automáticamente:', espError)
          }
        }
        
        mostrarMensaje('✅ ' + t('itemCreated', { type: t('doctor') }), 'success')
      }
      else if (tipo === 'enfermeras') {
        // Crear usuario primero
        const usuarioData = {
          username: formData.username,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email || '',
          telefono: formData.telefono || '',
          rol: 'nurse'
        }
        console.log('👉 Creando usuario:', usuarioData)
        
        const usuarioRes = await axiosInstance.post('usuarios/', usuarioData)
        const nuevoUsuario = usuarioRes.data
        console.log('✅ Usuario creado:', nuevoUsuario)
        
        // Crear perfil de enfermera
        const enfermeraData = {
          usuario_id: nuevoUsuario.id,
          especialidad: formData.especialidad || '',
          otra_especialidad: formData.otra_especialidad || '',
          numero_licencia: formData.numero_licencia || ''
        }
        console.log('👉 Creando enfermera:', enfermeraData)
        
        const enfermeraRes = await axiosInstance.post('enfermeras/', enfermeraData)
        console.log('Enfermera creada:', enfermeraRes.data)
        
        // Si se usó "otra_especialidad" y no se seleccionó una de la lista, crear la nueva especialidad
        if (formData.otra_especialidad && !formData.especialidad) {
          try {
            const nuevaEsp = await axiosInstance.post('especialidades/', {
              nombre: formData.otra_especialidad,
              descripcion: `Especialidad de enfermería creada automáticamente para Enf. ${nuevoUsuario.first_name} ${nuevoUsuario.last_name}`,
              tipo_especialidad: 'enfermeria',
              activo: true
            })
            console.log('Nueva especialidad de enfermería creada:', nuevaEsp.data)
            // Actualizar la enfermera con la nueva especialidad
            await axiosInstance.patch(`enfermeras/${enfermeraRes.data.id}/`, {
              especialidad: nuevaEsp.data.id,
              otra_especialidad: ''
            })
          } catch (espError) {
            console.warn('No se pudo crear la especialidad automáticamente:', espError)
          }
        }
        
        mostrarMensaje('✅ ' + t('itemCreated', { type: t('nurse') }), 'success')
      }
      else if (tipo === 'pacientes') {
        // Crear usuario paciente y perfil de paciente
        const usuarioData = {
          username: formData.username,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email || '',
          telefono: formData.telefono || '',
          fecha_nacimiento: formData.fecha_nacimiento || null,
          rol: 'patient'
        }
        console.log('👉 Creando usuario paciente:', usuarioData)
        const usuarioRes = await axiosInstance.post('usuarios/', usuarioData)
        const nuevoUsuario = usuarioRes.data
        console.log('✅ Usuario paciente creado:', nuevoUsuario)

        // El backend crea automáticamente el perfil de paciente via señal
        // Solo necesitamos actualizar los datos médicos si se proporcionaron
        let datosMedicosActualizados = true
        if (formData.grupo_sanguineo || formData.contacto_emergencia || formData.telefono_emergencia || formData.alergias) {
          try {
            // Buscar el perfil de paciente creado automáticamente usando filtro
            const pacientesRes = await axiosInstance.get(`pacientes/?usuario_id=${nuevoUsuario.id}`)
            const pacientesData = Array.isArray(pacientesRes.data) ? pacientesRes.data : (pacientesRes.data.results || [])
            const pacienteExistente = pacientesData[0]
            
            if (pacienteExistente) {
              // Actualizar el perfil existente con los datos médicos
              const pacienteData = {
                alergias: formData.alergias || '',
                grupo_sanguineo: formData.grupo_sanguineo || '',
                contacto_emergencia: formData.contacto_emergencia || '',
                telefono_emergencia: formData.telefono_emergencia || ''
              }
              console.log('👉 Actualizando perfil de paciente:', pacienteData)
              await axiosInstance.patch(`pacientes/${pacienteExistente.id}/`, pacienteData)
              console.log('✅ Perfil de paciente actualizado')
            } else {
              console.warn('⚠️ No se encontró el perfil de paciente creado automáticamente')
              datosMedicosActualizados = false
              mostrarMensaje('⚠️ Paciente creado pero no se encontró el perfil para actualizar datos médicos', 'warning')
            }
          } catch (error) {
            console.warn('⚠️ No se pudieron actualizar los datos médicos:', error)
            datosMedicosActualizados = false
            mostrarMensaje('⚠️ Paciente creado pero no se pudieron guardar los datos médicos', 'warning')
          }
        }
        // Solo mostrar mensaje de éxito si los datos médicos se actualizaron correctamente
        if (datosMedicosActualizados) {
          mostrarMensaje('✅ ' + t('itemCreated', { type: t('patient') }), 'success')
        }
      }
      else {
        // ✅ ESTA ES LA PARTE QUE SE EJECUTA PARA especialidades, usuarios, citas, horarios
        // ✅ Usa formData.tipo que DEBE ser 'especialidades', 'usuarios', 'citas', 'horarios'
        const response = await axiosInstance.post(`${tipo}/`, formData)
        console.log('✅ Creado:', response.data)
        mostrarMensaje('✅ ' + t('itemCreated', { type: tipo }), 'success')
      }
    }
    else if (modalMode === 'edit') {
      if (tipo === 'doctores') {
        // Actualizar usuario
        if (selectedItem.usuario) {
          const usuarioData = {
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email || '',
            telefono: formData.telefono || ''
          }
          await axiosInstance.patch(`usuarios/${selectedItem.usuario.id}/`, usuarioData)
        }
        
        // Actualizar perfil de doctor
        const doctorData = {
          especialidad: formData.especialidad || '',
          otra_especialidad: formData.otra_especialidad || '',
          biografia: formData.biografia || ''
        }
        const response = await axiosInstance.patch(`${tipo}/${selectedItem.id}/`, doctorData)
        console.log('Doctor actualizado:', response.data)
        
        // Si se usó "otra_especialidad" y no se seleccionó una de la lista, crear la nueva especialidad
        if (formData.otra_especialidad && !formData.especialidad) {
          try {
            const nuevaEsp = await axiosInstance.post('especialidades/', {
              nombre: formData.otra_especialidad,
              descripcion: `Especialidad médica actualizada automáticamente para Dr. ${selectedItem.usuario?.first_name} ${selectedItem.usuario?.last_name}`,
              tipo_especialidad: 'medica',
              activo: true
            })
            console.log('Nueva especialidad médica creada:', nuevaEsp.data)
            // Actualizar el doctor con la nueva especialidad
            await axiosInstance.patch(`doctores/${selectedItem.id}/`, {
              especialidad: nuevaEsp.data.id,
              otra_especialidad: ''
            })
          } catch (espError) {
            console.warn('No se pudo crear la especialidad automáticamente:', espError)
          }
        }
        
        mostrarMensaje('✅ ' + t('itemUpdated', { type: t('doctor') }), 'success')
      }
      else if (tipo === 'enfermeras') {
        // Actualizar usuario
        if (selectedItem.usuario) {
          const usuarioData = {
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email || '',
            telefono: formData.telefono || ''
          }
          await axiosInstance.patch(`usuarios/${selectedItem.usuario.id}/`, usuarioData)
        }
        
        // Actualizar perfil de enfermera
        const enfermeraData = {
          especialidad: formData.especialidad || '',
          otra_especialidad: formData.otra_especialidad || '',
          numero_licencia: formData.numero_licencia || ''
        }
        const response = await axiosInstance.patch(`${tipo}/${selectedItem.id}/`, enfermeraData)
        console.log('Enfermera actualizada:', response.data)
        
        // Si se usó "otra_especialidad" y no se seleccionó una de la lista, crear la nueva especialidad
        if (formData.otra_especialidad && !formData.especialidad) {
          try {
            const nuevaEsp = await axiosInstance.post('especialidades/', {
              nombre: formData.otra_especialidad,
              descripcion: `Especialidad de enfermería actualizada automáticamente para Enf. ${selectedItem.usuario?.first_name} ${selectedItem.usuario?.last_name}`,
              tipo_especialidad: 'enfermeria',
              activo: true
            })
            console.log('Nueva especialidad de enfermería creada:', nuevaEsp.data)
            // Actualizar la enfermera con la nueva especialidad
            await axiosInstance.patch(`enfermeras/${selectedItem.id}/`, {
              especialidad: nuevaEsp.data.id,
              otra_especialidad: ''
            })
          } catch (espError) {
            console.warn('No se pudo crear la especialidad automáticamente:', espError)
          }
        }
        
        mostrarMensaje('✅ ' + t('itemUpdated', { type: t('nurse') }), 'success')
      }
      else if (tipo === 'pacientes') {
        // Actualizar usuario paciente
        if (selectedItem.usuario) {
          const usuarioData = {
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email || '',
            telefono: formData.telefono || '',
            fecha_nacimiento: formData.fecha_nacimiento || null
          }
          await axiosInstance.patch(`usuarios/${selectedItem.usuario.id}/`, usuarioData)
        }
        // Actualizar perfil de paciente
        const pacienteData = {
          alergias: formData.alergias || '',
          grupo_sanguineo: formData.grupo_sanguineo || '',
          contacto_emergencia: formData.contacto_emergencia || '',
          telefono_emergencia: formData.telefono_emergencia || ''
        }
        const response = await axiosInstance.patch(`${tipo}/${selectedItem.id}/`, pacienteData)
        console.log('✅ Paciente actualizado:', response.data)
        mostrarMensaje('✅ ' + t('itemUpdated', { type: t('patient') }), 'success')
      }
      else {
        const response = await axiosInstance.patch(`${tipo}/${selectedItem.id}/`, formData)
        console.log('✅ Actualizado:', response.data)
        mostrarMensaje('✅ ' + t('itemUpdated', { type: tipo }), 'success')
      }
    }
    
    await loadAllData()
    setShowModal(false)
  } catch (error) {
    console.error('❌ Error en handleSubmit:', error)
    
    if (error.response) {
      console.error('Detalles del error:', error.response.data)
      console.error('Status:', error.response.status)
      
      let errorMsg = ''
      if (typeof error.response.data === 'object') {
        errorMsg = Object.entries(error.response.data)
          .map(([campo, msg]) => `${campo}: ${Array.isArray(msg) ? msg.join(', ') : msg}`)
          .join('\n')
      } else {
        errorMsg = error.response.data
      }
      
      setErrorBackend(errorMsg)
      mostrarMensaje(`Error ${error.response.status}: ${errorMsg}`, 'error')
    } else if (error.request) {
      setErrorBackend(t('connectionError'))
      mostrarMensaje(t('connectionError'), 'error')
    } else {
      setErrorBackend(t('errorSaving', { type: formData.tipo }))
      mostrarMensaje(t('errorSaving', { type: formData.tipo }), 'error')
    }
  } finally {
    setSaving(false)
  }
}

  // Cerrar modal
  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedItem(null)
    setFormData({})
    setErrorBackend('')
  }

  // ===== FUNCIONES AUXILIARES =====

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
      admin: 'var(--color-admin)',
      doctor: 'var(--color-doctor)',
      nurse: 'var(--color-nurse)',
      patient: 'var(--color-patient)'
    }
    return (
      <span style={{
        ...styles.rolBadge,
        backgroundColor: colores[rol] || 'var(--color-patient)'
      }}>
        {rol}
      </span>
    )
  }

  // Renderizado condicional
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <FaSpinner style={styles.loadingSpinner} />
        <p style={styles.loadingText}>Carregando painel de administracao...</p>
        <p style={styles.loadingSubtext}>Carregando usuarios, medicos, consultas...</p>
      </div>
    )
  }

  if (loadingError) {
    return (
      <div style={styles.errorContainer}>
        <FaExclamationTriangle style={styles.errorIcon} />
        <h2 style={styles.errorTitle}>Error</h2>
        <p style={styles.errorText}>{loadingError}</p>
        <button onClick={() => window.location.reload()} style={styles.retryButton}>
          <FaSync /> Tentar novamente
        </button>
        <button onClick={() => navigate('/dashboard')} style={styles.backButton}>
          ← {t('backToDashboard')}
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
            ⚙️ {t('adminDashboardTitle')}
          </h1>
          <p style={styles.subtitle}>
            {t('adminDashboardSubtitle')}
          </p>
        </div>
        <button onClick={() => navigate('/dashboard')} style={styles.backButton}>
          ← {t('backToDashboard')}
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
            <h3>{t('totalUsers')}</h3>
            <p>{stats.totalUsuarios}</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <FaUserMd style={styles.statIcon} />
          <div>
            <h3>{t('doctors')}</h3>
            <p>{stats.totalDoctores}</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <FaUserNurse style={styles.statIcon} />
          <div>
            <h3>{t('nurses')}</h3>
            <p>{stats.totalEnfermeras}</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <FaUserInjured style={styles.statIcon} />
          <div>
            <h3>{t('patientsTab')}</h3>
            <p>{stats.totalPacientes}</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <FaCalendarAlt style={styles.statIcon} />
          <div>
            <h3>{t('appointmentsToday')}</h3>
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
          <FaUsers /> {t('manageUsers')} ({stats.totalUsuarios})
        </button>
        <button
          style={{...styles.tab, ...(activeTab === 'doctores' && styles.activeTab)}}
          onClick={() => setActiveTab('doctores')}
        >
          <FaUserMd /> {t('manageDoctors')} ({stats.totalDoctores})
        </button>
        <button
          style={{...styles.tab, ...(activeTab === 'enfermeras' && styles.activeTab)}}
          onClick={() => setActiveTab('enfermeras')}
        >
          <FaUserNurse /> {t('manageNurses')} ({stats.totalEnfermeras})
        </button>
        <button
          style={{...styles.tab, ...(activeTab === 'pacientes' && styles.activeTab)}}
          onClick={() => setActiveTab('pacientes')}
        >
          <FaUserInjured /> {t('patientsTab')} ({stats.totalPacientes})
        </button>
        <button
          style={{...styles.tab, ...(activeTab === 'citas' && styles.activeTab)}}
          onClick={() => setActiveTab('citas')}
        >
          <FaCalendarAlt /> {t('appointments')} ({stats.citasTotales})
        </button>
        <button
          style={{...styles.tab, ...(activeTab === 'especialidades' && styles.activeTab)}}
          onClick={() => setActiveTab('especialidades')}
        >
          <FaStethoscope /> {t('specialties')} ({especialidades.length})
        </button>
        <button
          style={{...styles.tab, ...(activeTab === 'horarios' && styles.activeTab)}}
          onClick={() => setActiveTab('horarios')}
        >
          <FaClock /> {t('schedules')} ({horarios.length})
        </button>
      </div>

      {/* Contenido según tab activo */}
      <div style={styles.content}>
        {/* Tab: Dashboard */}
        {activeTab === 'dashboard' && (
          <div>
            <h2 style={styles.sectionTitle}>{t('generalSummary')}</h2>
            <div style={styles.dashboardGrid}>
              <div style={styles.dashboardCard}>
                <h4>{t('usersByRole')}</h4>
                <div style={styles.statsList}>
                  <div><span>{t('administrators')}:</span> <strong>{usuarios.filter(u => u.rol === 'admin').length}</strong></div>
                  <div><span>{t('doctors')}:</span> <strong>{stats.totalDoctores}</strong></div>
                  <div><span>{t('nurses')}:</span> <strong>{stats.totalEnfermeras}</strong></div>
                  <div><span>{t('patientsTab')}:</span> <strong>{stats.totalPacientes}</strong></div>
                </div>
              </div>
              <div style={styles.dashboardCard}>
                <h4>{t('appointments')}</h4>
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
              <h2 style={styles.sectionTitle}>{t('userManagement')}</h2>
              <button onClick={() => handleCreate('usuarios')} style={styles.createButton}>
                <FaPlus /> {t('newUser')}
              </button>
            </div>
            {todosLosUsuarios.length === 0 ? (
              <div style={styles.emptyState}>
                <p>Nao ha usuarios cadastrados</p>
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
                    {todosLosUsuarios.map(user => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.username}</td>
                        <td>{user.first_name} {user.last_name}</td>
                        <td>{user.email || '-'}</td>
                        <td>{getRolBadge(user.rol)}</td>
                        <td>{user.telefono || '-'}</td>
                        <td style={styles.actions}>
                          <button onClick={() => handleView(user, 'usuarios')} style={styles.viewButton} title="Ver">
                            <FaEye />
                          </button>
                          <button onClick={() => handleEdit(user, 'usuarios')} style={styles.editButton} title={t('edit')}>
                            <FaEdit />
                          </button>
                          <button onClick={() => handleDelete('usuarios', user.id)} style={styles.deleteButton} title={t('delete')}>
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
              <h2 style={styles.sectionTitle}>{t('manageDoctors')}</h2>
              <button onClick={() => handleCreate('doctores')} style={styles.createButton}>
                <FaPlus /> {t('registerNew')}
              </button>
            </div>
            {doctores.length === 0 ? (
              <div style={styles.emptyState}>
                <p>{t('noDoctorsFound')}</p>
              </div>
            ) : (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>{t('name')}</th>
                      <th>{t('specialty')}</th>
                      <th>{t('email')}</th>
                      <th>Teléfono</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctores.map(doctor => (
                      <tr key={doctor.id}>
                        <td>{doctor.id}</td>
                        <td>Dr. {doctor.usuario?.first_name} {doctor.usuario?.last_name}</td>
                        <td>
                          {doctor.especialidad_nombre || doctor.otra_especialidad || '-'}
                          {doctor.otra_especialidad && !doctor.especialidad_nombre && ' ✏️'}
                        </td>
                        <td>{doctor.usuario?.email || '-'}</td>
                        <td>{doctor.usuario?.telefono || '-'}</td>
                        <td style={styles.actions}>
                          <button onClick={() => handleView(doctor, 'doctores')} style={styles.viewButton} title="Ver">
                            <FaEye />
                          </button>
                          <button onClick={() => handleEdit(doctor, 'doctores')} style={styles.editButton} title={t('edit')}>
                            <FaEdit />
                          </button>
                          <button onClick={() => handleDelete('doctores', doctor.id)} style={styles.deleteButton} title={t('delete')}>
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
              <h2 style={styles.sectionTitle}>{t('manageNurses')}</h2>
              <button onClick={() => handleCreate('enfermeras')} style={styles.createButton}>
                <FaPlus /> {t('registerNew')}
              </button>
            </div>
            {enfermeras.length === 0 ? (
              <div style={styles.emptyState}>
                <p>{t('noNursesFound')}</p>
              </div>
            ) : (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>{t('name')}</th>
                      <th>{t('specialty')}</th>
                      <th>{t('licenseNumber')}</th>
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
                        <td>
                          {enfermera.especialidad_nombre || enfermera.otra_especialidad || 'General'}
                          {enfermera.otra_especialidad && !enfermera.especialidad_nombre && ' ✏️'}
                        </td>
                        <td>{enfermera.numero_licencia || '-'}</td>
                        <td>{enfermera.usuario?.email || '-'}</td>
                        <td>{enfermera.usuario?.telefono || '-'}</td>
                        <td style={styles.actions}>
                          <button onClick={() => handleView(enfermera, 'enfermeras')} style={styles.viewButton} title="Ver">
                            <FaEye />
                          </button>
                          <button onClick={() => handleEdit(enfermera, 'enfermeras')} style={styles.editButton} title={t('edit')}>
                            <FaEdit />
                          </button>
                          <button onClick={() => handleDelete('enfermeras', enfermera.id)} style={styles.deleteButton} title={t('delete')}>
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

        {/* Tab: Pacientes */}
        {activeTab === 'pacientes' && (
          <div>
            <div style={styles.tableHeader}>
              <h2 style={styles.sectionTitle}>{t('patientManagement')}</h2>
              <button onClick={() => handleCreate('pacientes')} style={styles.createButton}>
                <FaPlus /> {t('newPatient')}
              </button>
            </div>
            {pacientes.length === 0 ? (
              <div style={styles.emptyState}>
                <p>No hay pacientes registrados</p>
              </div>
            ) : (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>{t('bloodType')}</th>
                      <th>{t('emergencyContact')}</th>
                      <th>{t('emergencyPhone')}</th>
                      <th>Email</th>
                      <th>Teléfono</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pacientes.map(paciente => (
                      <tr key={paciente.id}>
                        <td>{paciente.id}</td>
                        <td>{paciente.usuario?.first_name} {paciente.usuario?.last_name}</td>
                        <td>{paciente.grupo_sanguineo || '-'}</td>
                        <td>{paciente.contacto_emergencia || '-'}</td>
                        <td>{paciente.telefono_emergencia || '-'}</td>
                        <td>{paciente.usuario?.email || '-'}</td>
                        <td>{paciente.usuario?.telefono || '-'}</td>
                        <td style={styles.actions}>
                          <button onClick={() => handleView(paciente, 'pacientes')} style={styles.viewButton} title="Ver">
                            <FaEye />
                          </button>
                          <button onClick={() => handleEdit(paciente, 'pacientes')} style={styles.editButton} title={t('edit')}>
                            <FaEdit />
                          </button>
                          <button onClick={() => handleDelete('pacientes', paciente.id)} style={styles.deleteButton} title={t('delete')}>
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
              <h2 style={styles.sectionTitle}>{t('appointmentManagement')}</h2>
              <button onClick={() => handleCreate('citas')} style={styles.createButton}>
                <FaPlus /> {t('registerNew')}
              </button>
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
                      <th>{t('id')}</th>
                      <th>{t('patient')}</th>
                      <th>{t('doctor')}</th>
                      <th>{t('tableDate')}</th>
                      <th>{t('tableTime')}</th>
                      <th>{t('status')}</th>
                      <th>{t('tableReason')}</th>
                      <th>{t('tableActions')}</th>
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
                          <button onClick={() => handleEdit(cita, 'citas')} style={styles.editButton} title={t('edit')}>
                            <FaEdit />
                          </button>
                          <button onClick={() => handleDelete('citas', cita.id)} style={styles.deleteButton} title={t('delete')}>
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

        {/* Tab: Especialidades */}
        {activeTab === 'especialidades' && (
          <div>
            <div style={styles.tableHeader}>
              <h2 style={styles.sectionTitle}>{t('specialtyManagement')}</h2>
              <button onClick={() => handleCreate('especialidades')} style={styles.createButton}>
                <FaPlus /> {t('newSpecialty')}
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
                      <th>{t('tableId')}</th>
                      <th>{t('tableName')}</th>
                      <th>{t('tableType')}</th>
                      <th>{t('tableDescription')}</th>
                      <th>{t('tableState')}</th>
                      <th>{t('tableActions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {especialidades.map(esp => (
                      <tr key={esp.id}>
                        <td>{esp.id}</td>
                        <td>{esp.nombre}</td>
                        <td>
                          {esp.tipo === 'medica' && '🔬 Médica'}
                          {esp.tipo === 'enfermeria' && '💉 Enfermería'}
                          {esp.tipo === 'ambas' && '🔄 Ambas'}
                        </td>
                        <td>{esp.descripcion || '-'}</td>
                        <td>
                          <span style={{
                            ...styles.badge,
                            backgroundColor: esp.activo ? '#27ae60' : '#e74c3c',
                            color: 'white'
                          }}>
                            {esp.activo ? t('active') : t('inactive')}
                          </span>
                        </td>
                        <td style={styles.actions}>
                          <button onClick={() => handleView(esp, 'especialidades')} style={styles.viewButton} title="Ver">
                            <FaEye />
                          </button>
                          <button onClick={() => handleEdit(esp, 'especialidades')} style={styles.editButton} title={t('edit')}>
                            <FaEdit />
                          </button>
                          <button onClick={() => handleDelete('especialidades', esp.id)} style={styles.deleteButton} title={t('delete')}>
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
              <h2 style={styles.sectionTitle}>{t('scheduleManagement')}</h2>
              <button onClick={() => handleCreate('horarios')} style={styles.createButton}>
                <FaPlus /> {t('newSchedule')}
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
                      <th>{t('id')}</th>
                      <th>{t('doctor')}</th>
                      <th>{t('day')}</th>
                      <th>{t('tableStartTime')}</th>
                      <th>{t('tableEndTime')}</th>
                      <th>{t('tableState')}</th>
                      <th>{t('tableActions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {horarios.map(horario => {
                      const dias = [
                        t('monday'),
                        t('tuesday'),
                        t('wednesday'),
                        t('thursday'),
                        t('friday'),
                        t('saturday'),
                        t('sunday')
                      ]
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
                              backgroundColor: horario.activo ? '#27ae60' : '#e74c3c',
                              color: 'white'
                            }}>
                              {horario.activo ? t('active') : t('inactive')}
                            </span>
                          </td>
                          <td style={styles.actions}>
                            <button onClick={() => handleView(horario, 'horarios')} style={styles.viewButton} title="Ver">
                              <FaEye />
                            </button>
                            <button onClick={() => handleEdit(horario, 'horarios')} style={styles.editButton} title={t('edit')}>
                              <FaEdit />
                            </button>
                            <button onClick={() => handleDelete('horarios', horario.id)} style={styles.deleteButton} title={t('delete')}>
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
        <div style={styles.modalOverlay} onClick={handleCloseModal}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>
              {modalMode === 'create' && `${t('createNew')} ${formData.tipo}`}
              {modalMode === 'edit' && `${t('editItem')} ${formData.tipo}`}
              {modalMode === 'view' && `${t('viewItem')} ${formData.tipo}`}
            </h2>
            
            {/* Error del backend */}
            {errorBackend && (
              <div style={styles.errorBackend}>
                <FaExclamationTriangle />
                <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{errorBackend}</pre>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              {/* Modal para USUARIOS */}
              {formData.tipo === 'usuarios' && (
                <>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Username *</label>
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

                  {modalMode === 'create' && (
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Contraseña *</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password || ''}
                        onChange={handleInputChange}
                        style={styles.input}
                        required
                        minLength="8"
                      />
                    </div>
                  )}

                  <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Nombre *</label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name || ''}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                        style={styles.input}
                        required
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Apellido *</label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name || ''}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                        style={styles.input}
                        required
                      />
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Email (opcional)</label>
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
                    <label style={styles.label}>Teléfono (opcional)</label>
                    <input
                      type="text"
                      name="telefono"
                      value={formData.telefono || ''}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      style={styles.input}
                      placeholder="+244 XXX XXX XXX"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Rol *</label>
                    <select
                      name="rol"
                      value={formData.rol || 'patient'}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      style={styles.select}
                      required
                    >
                      <option value="patient">{t('patient')}</option>
                      <option value="doctor">{t('doctor')}</option>
                      <option value="nurse">{t('nurse')}</option>
                      <option value="admin">{t('administrator')}</option>
                    </select>
                  </div>
                </>
              )}

              {/* Modal para DOCTOR */}
              {formData.tipo === 'doctores' && (
                <>
                  <h3 style={styles.modalSubtitle}>Datos de Usuario</h3>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Username *</label>
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
                  
                  {modalMode === 'create' && (
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Contraseña *</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password || ''}
                        onChange={handleInputChange}
                        style={styles.input}
                        required
                        minLength="8"
                      />
                    </div>
                  )}
                  
                  <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Nombre *</label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name || ''}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                        style={styles.input}
                        required
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Apellido *</label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name || ''}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                        style={styles.input}
                        required
                      />
                    </div>
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Email (opcional)</label>
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
                    <label style={styles.label}>Teléfono (opcional)</label>
                    <input
                      type="text"
                      name="telefono"
                      value={formData.telefono || ''}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      style={styles.input}
                      placeholder="+244 XXX XXX XXX"
                    />
                  </div>
                  
                  <h3 style={styles.modalSubtitle}>{t('professionalData')}</h3>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.label}>{t('specialty')} {t('requiredFieldIndicator')}</label>
                    <select
                      name="especialidad"
                      value={formData.especialidad || ''}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      style={styles.select}
                    >
                      <option value="">{t('selectSpecialty')}</option>
                      {especialidades.filter(e => e.tipo_especialidad === 'medica' || e.tipo_especialidad === 'ambas').map(esp => (
                        <option key={esp.id} value={esp.id}>
                          {esp.nombre}
                        </option>
                      ))}
                    </select>
                    <small style={styles.hint}>Selecciona una especialidad existente o escribe una nueva abajo</small>
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Otra especialidad (si no está en la lista)</label>
                    <input
                      type="text"
                      name="otra_especialidad"
                      value={formData.otra_especialidad || ''}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      style={styles.input}
                      placeholder="Ej: Medicina Tropical"
                    />
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Biografía (opcional)</label>
                    <textarea
                      name="biografia"
                      value={formData.biografia || ''}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      style={styles.textarea}
                      rows="4"
                      placeholder="Formación, experiencia, etc."
                    />
                  </div>
                </>
              )}

              {/* Modal para ENFERMERA */}
              {formData.tipo === 'enfermeras' && (
                <>
                  <h3 style={styles.modalSubtitle}>Datos de Usuario</h3>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Username *</label>
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
                  
                  {modalMode === 'create' && (
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Contraseña *</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password || ''}
                        onChange={handleInputChange}
                        style={styles.input}
                        required
                        minLength="8"
                      />
                    </div>
                  )}
                  
                  <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Nombre *</label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name || ''}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                        style={styles.input}
                        required
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Apellido *</label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name || ''}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                        style={styles.input}
                        required
                      />
                    </div>
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Email (opcional)</label>
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
                    <label style={styles.label}>Teléfono (opcional)</label>
                    <input
                      type="text"
                      name="telefono"
                      value={formData.telefono || ''}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      style={styles.input}
                      placeholder="+244 XXX XXX XXX"
                    />
                  </div>
                  
                  <h3 style={styles.modalSubtitle}>{t('professionalData')}</h3>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.label}>{t('specialty')} ({t('optional')})</label>
                    <select
                      name="especialidad"
                      value={formData.especialidad || ''}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      style={styles.select}
                    >
                      <option value="">Sin especialidad</option>
                      {especialidades.filter(e => e.tipo_especialidad === 'enfermeria' || e.tipo_especialidad === 'ambas').map(esp => (
                        <option key={esp.id} value={esp.id}>
                          {esp.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Otra especialidad (opcional)</label>
                    <input
                      type="text"
                      name="otra_especialidad"
                      value={formData.otra_especialidad || ''}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      style={styles.input}
                      placeholder="Ej: Enfermería Pediátrica"
                    />
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Número de Licencia (opcional)</label>
                    <input
                      type="text"
                      name="numero_licencia"
                      value={formData.numero_licencia || ''}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      style={styles.input}
                    />
                  </div>
                </>
              )}

              {/* Modal para PACIENTES */}
              {formData.tipo === 'pacientes' && (
                <>
                  <h3 style={styles.modalSubtitle}>Datos de Usuario</h3>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Username *</label>
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

                  {modalMode === 'create' && (
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Contraseña *</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password || ''}
                        onChange={handleInputChange}
                        style={styles.input}
                        required
                        minLength="8"
                      />
                    </div>
                  )}

                  <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Nombre *</label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name || ''}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                        style={styles.input}
                        required
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Apellido *</label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name || ''}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                        style={styles.input}
                        required
                      />
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Email (opcional)</label>
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
                    <label style={styles.label}>Teléfono (opcional)</label>
                    <input
                      type="text"
                      name="telefono"
                      value={formData.telefono || ''}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      style={styles.input}
                      placeholder="+244 XXX XXX XXX"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Fecha de Nacimiento (opcional)</label>
                    <input
                      type="date"
                      name="fecha_nacimiento"
                      value={formData.fecha_nacimiento || ''}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      style={styles.input}
                    />
                  </div>

                  <h3 style={styles.modalSubtitle}>Datos Médicos</h3>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Grupo Sanguíneo</label>
                    <input
                      type="text"
                      name="grupo_sanguineo"
                      value={formData.grupo_sanguineo || ''}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Alergias</label>
                    <textarea
                      name="alergias"
                      value={formData.alergias || ''}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      style={{...styles.input, minHeight: '80px', resize: 'vertical'}}
                      placeholder="Alergias conocidas del paciente"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>{t('emergencyContact')}</label>
                    <input
                      type="text"
                      name="contacto_emergencia"
                      value={formData.contacto_emergencia || ''}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Teléfono de Emergencia</label>
                    <input
                      type="text"
                      name="telefono_emergencia"
                      value={formData.telefono_emergencia || ''}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      style={styles.input}
                    />
                  </div>
                </>
              )}

              {/* Modal para CITAS */}
              {formData.tipo === 'citas' && (
                <>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>{t('patient')} *</label>
                    <select
                      name="paciente"
                      value={formData.paciente || ''}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      style={styles.select}
                      required
                    >
                      <option value="">{t('selectPatient')}</option>
                      {usuarios.filter(u => u.rol === 'patient').map(u => (
                        <option key={u.id} value={u.id}>
                          {u.first_name} {u.last_name} - {u.username}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Doctor *</label>
                    <select
                      name="doctor"
                      value={formData.doctor || ''}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      style={styles.select}
                      required
                    >
                      <option value="">{t('selectDoctor')}</option>
                      {doctores.map(d => (
                        <option key={d.id} value={d.id}>
                          Dr. {d.usuario?.first_name} {d.usuario?.last_name} - {d.especialidad_nombre || d.otra_especialidad || 'Especialidad no especificada'}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>{t('date')} *</label>
                      <input
                        type="date"
                        name="fecha"
                        value={formData.fecha || ''}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                        style={styles.input}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>{t('time')} *</label>
                      <input
                        type="time"
                        name="hora"
                        value={formData.hora || ''}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                        style={styles.input}
                        required
                      />
                    </div>
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.label}>{t('status')} *</label>
                    <select
                      name="estado"
                      value={formData.estado || 'pendiente'}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      style={styles.select}
                    >
                      <option value="pendente">{t('pending')}</option>
                      <option value="confirmada">{t('confirmed')}</option>
                      <option value="completada">{t('completed')}</option>
                      <option value="cancelada">{t('cancelled')}</option>
                      <option value="no_asistio">{t('noShow')}</option>
                    </select>
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Motivo de la consulta (opcional)</label>
                    <textarea
                      name="motivo"
                      value={formData.motivo || ''}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      style={styles.textarea}
                      rows="3"
                      placeholder="Describe el motivo de la consulta..."
                    />
                  </div>
                  
                  {modalMode === 'view' && selectedItem && (
                    <div style={styles.infoCard}>
                      <p><strong>📋 {t('appointmentHistory')}:</strong></p>
                      <p>📅 {t('created')}: {new Date(selectedItem?.fecha_creacion).toLocaleString()}</p>
                      {selectedItem?.fecha_actualizacion && (
                        <p>🔄 Última actualización: {new Date(selectedItem.fecha_actualizacion).toLocaleString()}</p>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Modal para ESPECIALIDADES */}
              {formData.tipo === 'especialidades' && (
                <>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Nombre *</label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre || ''}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      style={styles.input}
                      required
                    />
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Tipo *</label>
                    <select
                      name="tipo_especialidad"
                      value={formData.tipo_especialidad || 'medica'}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      style={styles.select}
                    >
                      <option value="medica">🔬 Médica</option>
                      <option value="enfermeria">💉 Enfermería</option>
                      <option value="ambas">🔄 Ambas</option>
                    </select>
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Descripción (opcional)</label>
                    <textarea
                      name="descripcion"
                      value={formData.descripcion || ''}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      style={styles.textarea}
                      rows="3"
                      placeholder="Describe la especialidad..."
                    />
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="activo"
                        checked={formData.activo || false}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                      /> {t('active')}
                    </label>
                  </div>
                </>
              )}

              {/* Modal para HORARIOS */}
              {formData.tipo === 'horarios' && (
                <>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Doctor *</label>
                    <select
                      name="doctor"
                      value={formData.doctor || ''}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      style={styles.select}
                      required
                    >
                      <option value="">{t('selectDoctor')}</option>
                      {doctores.map(d => (
                        <option key={d.id} value={d.id}>
                          Dr. {d.usuario?.first_name} {d.usuario?.last_name} - {d.especialidad_nombre || d.otra_especialidad || 'Especialidad no especificada'}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.label}>{t('adminDayOfWeek')} *</label>
                    <select
                      name="dia_semana"
                      value={formData.dia_semana || 0}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      style={styles.select}
                    >
                      <option value="0">{t('monday')}</option>
                      <option value="1">{t('tuesday')}</option>
                      <option value="2">{t('wednesday')}</option>
                      <option value="3">{t('thursday')}</option>
                      <option value="4">{t('friday')}</option>
                      <option value="5">{t('saturday')}</option>
                      <option value="6">{t('sunday')}</option>
                    </select>
                  </div>
                  
                  <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Hora inicio *</label>
                      <input
                        type="time"
                        name="hora_inicio"
                        value={formData.hora_inicio || '09:00'}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Hora fin *</label>
                      <input
                        type="time"
                        name="hora_fin"
                        value={formData.hora_fin || '17:00'}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                        style={styles.input}
                      />
                    </div>
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="activo"
                        checked={formData.activo || false}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                      /> Activo
                    </label>
                  </div>
                </>
              )}

              {modalMode !== 'view' && (
                <div style={styles.modalButtons}>
                  <button 
                    type="submit" 
                    style={styles.saveButton}
                    disabled={saving}
                  >
                    {saving ? <FaSpinner style={styles.spinner} /> : <FaSave />}
                    {saving ? t('saving') : t('save')}
                  </button>
                  <button 
                    type="button" 
                    onClick={handleCloseModal} 
                    style={styles.cancelButton}
                    disabled={saving}
                  >
                    <FaBan /> Cancelar
                  </button>
                </div>
              )}
              
              {modalMode === 'view' && (
                <button 
                  type="button" 
                  onClick={handleCloseModal} 
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

// ===== ESTILOS =====
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
  errorText: {
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
    fontSize: '14px'
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
    backgroundColor: 'var(--color-success-bg)',
    color: 'var(--color-success-text)',
    padding: '15px 20px',
    borderRadius: '10px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    border: '1px solid #c3e6cb'
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
  messageText: {
    fontSize: '14px',
    flex: 1
  },
  errorBackend: {
    backgroundColor: 'var(--color-error-bg)',
    color: 'var(--color-error-text)',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    border: '1px solid #f5c6cb',
    fontSize: '13px',
    maxHeight: '200px',
    overflowY: 'auto'
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
    backgroundColor: 'var(--color-warning)',
    color: 'white',
    padding: '5px 8px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  deleteButton: {
    backgroundColor: 'var(--color-danger)',
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
    display: 'inline-block'
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
    maxWidth: '600px',
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
  modalSubtitle: {
    fontSize: '16px',
    color: 'var(--color-admin)',
    margin: '20px 0 10px 0',
    paddingBottom: '5px',
    borderBottom: '1px solid var(--border-color)'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px'
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
  textarea: {
    padding: '10px',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    fontSize: '14px',
    resize: 'vertical',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    minHeight: '80px'
  },
  select: {
    padding: '10px',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)'
  },
  hint: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginTop: '2px'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'var(--text-primary)',
    cursor: 'pointer'
  },
  modalButtons: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px'
  },
  saveButton: {
    backgroundColor: 'var(--color-success)',
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
    backgroundColor: 'var(--color-cancelled)',
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
  infoCard: {
    backgroundColor: 'var(--bg-tertiary)',
    padding: '15px',
    borderRadius: '8px',
    marginTop: '20px',
    border: '1px solid var(--border-color)'
  },
  spinner: {
    animation: 'spin 1s linear infinite'
  }
}

export default AdminDashboard








