import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import { 
  FaUser, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash,
  FaCheckCircle, FaExclamationTriangle, FaSpinner, FaUserPlus
} from 'react-icons/fa'

function Registro() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    email: '',
    telefono: '',
    rol: 'patient'  // Por defecto paciente
  })
  
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: '',
    color: '#95a5a6'
  })
  
  const navigate = useNavigate()

  // Validar fortaleza de contraseña
  const validatePasswordStrength = (password) => {
    let score = 0
    let message = ''
    let color = '#95a5a6'

    if (password.length >= 4) score += 1
    if (password.length >= 6) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1

    if (password.length === 0) {
      message = 'Ingresa una contraseña'
      color = '#95a5a6'
    } else if (score <= 2) {
      message = 'Contraseña débil'
      color = '#e74c3c'
    } else if (score <= 3) {
      message = 'Contraseña media'
      color = '#f39c12'
    } else if (score <= 4) {
      message = 'Contraseña fuerte'
      color = '#27ae60'
    } else {
      message = 'Contraseña muy fuerte'
      color = '#27ae60'
    }

    setPasswordStrength({ score, message, color })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Limpiar error del campo específico
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }

    // Validar fortaleza de contraseña
    if (name === 'password') {
      validatePasswordStrength(value)
    }

    // Limpiar error general
    if (error) setError('')
  }

  const validateForm = () => {
    const newErrors = {}

    // Validar username
    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido'
    } else if (formData.username.length < 3) {
      newErrors.username = 'El usuario debe tener al menos 3 caracteres'
    }

    // Validar contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida'
    } else if (formData.password.length < 4) {
      newErrors.password = 'La contraseña debe tener al menos 4 caracteres'
    }

    // Validar nombre
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'El nombre es requerido'
    }

    // Validar apellido
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'El apellido es requerido'
    }

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    // Validar teléfono (opcional pero con formato)
    if (formData.telefono && !/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(formData.telefono)) {
      newErrors.telefono = 'Formato de teléfono inválido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validar formulario
    if (!validateForm()) {
      setError('Por favor corrige los errores en el formulario')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    console.log('Enviando registro:', formData)

    try {
      // Configurar timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await axios.post(
        'http://127.0.0.1:8000/api/registro/', 
        formData,
        {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      clearTimeout(timeoutId)

      console.log('Respuesta del servidor:', response.data)
      
      setSuccess('¡Registro exitoso! Redirigiendo al login...')
      
      // Guardar tokens si el registro devuelve tokens
      if (response.data.access) {
        localStorage.setItem('access_token', response.data.access)
        localStorage.setItem('refresh_token', response.data.refresh)
        setTimeout(() => navigate('/dashboard'), 2000)
      } else {
        setTimeout(() => navigate('/login'), 2000)
      }
    } catch (err) {
      console.error('Error detallado:', err)

      if (err.name === 'AbortError' || err.code === 'ECONNABORTED') {
        setError('Tiempo de espera agotado. Verifica que el servidor esté corriendo.')
      } else if (err.response) {
        // Errores del servidor
        console.error('Error response:', err.response.data)
        
        if (err.response.status === 400) {
          // Errores de validación del backend
          const backendErrors = err.response.data
          
          if (typeof backendErrors === 'object') {
            // Mostrar errores específicos del backend
            const errorMessages = []
            Object.entries(backendErrors).forEach(([field, messages]) => {
              if (Array.isArray(messages)) {
                errorMessages.push(`${field}: ${messages.join(', ')}`)
                // Marcar el campo con error
                setErrors(prev => ({
                  ...prev,
                  [field]: messages[0]
                }))
              }
            })
            
            if (errorMessages.length > 0) {
              setError(errorMessages.join('\n'))
            } else {
              setError('Error en los datos enviados')
            }
          } else {
            setError(backendErrors.message || 'Error en el registro')
          }
        } else if (err.response.status === 409) {
          setError('El nombre de usuario ya existe')
          setErrors(prev => ({
            ...prev,
            username: 'Este usuario ya está registrado'
          }))
        } else {
          setError(`Error del servidor: ${err.response.status}`)
        }
      } else if (err.request) {
        setError('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.')
      } else {
        setError('Error al conectar con el servidor')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDemoData = () => {
    setFormData({
      username: 'paciente_demo',
      password: 'Demo123!',
      first_name: 'Juan',
      last_name: 'Pérez',
      email: 'juan.perez@email.com',
      telefono: '+244 923 456 789',
      rol: 'patient'
    })
    validatePasswordStrength('Demo123!')
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Logo y título */}
        <div style={styles.header}>
          <FaUserPlus style={styles.headerIcon} />
          <h1 style={styles.title}>Belkis-saúde</h1>
          <p style={styles.subtitle}>Crear nueva cuenta</p>
        </div>

        {/* Mensajes */}
        {error && (
          <div style={styles.errorContainer}>
            <FaExclamationTriangle style={styles.messageIcon} />
            <div style={styles.errorText}>{error}</div>
          </div>
        )}

        {success && (
          <div style={styles.successContainer}>
            <FaCheckCircle style={styles.messageIcon} />
            <div style={styles.successText}>{success}</div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Nombre y Apellido en fila */}
          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <FaUser style={styles.inputIcon} />
                Nombre *
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(errors.first_name ? styles.inputError : {})
                }}
                placeholder="Tu nombre"
                disabled={loading}
                maxLength="50"
              />
              {errors.first_name && (
                <span style={styles.fieldError}>{errors.first_name}</span>
              )}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <FaUser style={styles.inputIcon} />
                Apellido *
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(errors.last_name ? styles.inputError : {})
                }}
                placeholder="Tu apellido"
                disabled={loading}
                maxLength="50"
              />
              {errors.last_name && (
                <span style={styles.fieldError}>{errors.last_name}</span>
              )}
            </div>
          </div>

          {/* Usuario */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <FaUser style={styles.inputIcon} />
              Usuario *
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              style={{
                ...styles.input,
                ...(errors.username ? styles.inputError : {})
              }}
              placeholder="Ej: juan.perez"
              disabled={loading}
              maxLength="30"
              autoComplete="off"
            />
            {errors.username && (
              <span style={styles.fieldError}>{errors.username}</span>
            )}
            <span style={styles.inputHint}>Mínimo 3 caracteres</span>
          </div>

          {/* Email */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <FaEnvelope style={styles.inputIcon} />
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={{
                ...styles.input,
                ...(errors.email ? styles.inputError : {})
              }}
              placeholder="correo@ejemplo.com"
              disabled={loading}
              autoComplete="off"
            />
            {errors.email && (
              <span style={styles.fieldError}>{errors.email}</span>
            )}
          </div>

          {/* Teléfono */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <FaPhone style={styles.inputIcon} />
              Teléfono
            </label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              style={{
                ...styles.input,
                ...(errors.telefono ? styles.inputError : {})
              }}
              placeholder="+244 XXX XXX XXX"
              disabled={loading}
            />
            {errors.telefono && (
              <span style={styles.fieldError}>{errors.telefono}</span>
            )}
            <span style={styles.inputHint}>Formato: +244 923 456 789</span>
          </div>

          {/* Contraseña */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <FaLock style={styles.inputIcon} />
              Contraseña *
            </label>
            <div style={styles.passwordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                style={{
                  ...styles.passwordInput,
                  ...(errors.password ? styles.inputError : {})
                }}
                placeholder="••••••••"
                disabled={loading}
                maxLength="50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.passwordToggle}
                tabIndex="-1"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && (
              <span style={styles.fieldError}>{errors.password}</span>
            )}
            
            {/* Indicador de fortaleza de contraseña */}
            {formData.password && (
              <div style={styles.strengthContainer}>
                <div style={styles.strengthBar}>
                  <div style={{
                    ...styles.strengthFill,
                    width: `${(passwordStrength.score / 5) * 100}%`,
                    backgroundColor: passwordStrength.color
                  }} />
                </div>
                <span style={{...styles.strengthText, color: passwordStrength.color}}>
                  {passwordStrength.message}
                </span>
              </div>
            )}
            
            <span style={styles.inputHint}>Mínimo 4 caracteres</span>
          </div>

          {/* Rol (fijo como patient, oculto) */}
          <input type="hidden" name="rol" value="patient" />

          {/* Botón de registro */}
          <button 
            type="submit" 
            style={{
              ...styles.submitButton,
              ...(loading ? styles.submitButtonDisabled : {})
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <FaSpinner style={styles.spinner} />
                Registrando...
              </>
            ) : (
              <>
                <FaUserPlus />
                Crear Cuenta
              </>
            )}
          </button>

          {/* Botón de demo (solo desarrollo) */}
          {process.env.NODE_ENV === 'development' && !loading && (
            <button 
              type="button"
              onClick={handleDemoData}
              style={styles.demoButton}
            >
              🚀 Cargar datos de demo
            </button>
          )}
        </form>

        {/* Enlace a login */}
        <div style={styles.loginContainer}>
          <p style={styles.loginText}>
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" style={styles.loginLink}>
              Inicia Sesión
            </Link>
          </p>
        </div>

        {/* Términos y condiciones */}
        <div style={styles.termsContainer}>
          <p style={styles.termsText}>
            Al registrarte, aceptas nuestros{' '}
            <a href="/terminos" style={styles.termsLink}>Términos y Condiciones</a>{' '}
            y{' '}
            <a href="/privacidad" style={styles.termsLink}>Política de Privacidad</a>
          </p>
        </div>
      </div>
    </div>
  )
}

// Estilos
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-primary)',
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  card: {
    backgroundColor: 'var(--bg-secondary)',
    padding: '40px',
    borderRadius: '20px',
    boxShadow: 'var(--box-shadow)',
    width: '100%',
    maxWidth: '500px',
    border: '1px solid var(--border-color)',
    transition: 'transform 0.3s'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  headerIcon: {
    fontSize: '48px',
    color: 'var(--color-patient)',
    marginBottom: '10px'
  },
  title: {
    color: 'var(--text-primary)',
    fontSize: '28px',
    margin: '0 0 5px 0',
    fontWeight: '700'
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '14px',
    margin: 0
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    border: '1px solid #f5c6cb',
    borderRadius: '10px',
    padding: '15px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  successContainer: {
    backgroundColor: '#d4edda',
    border: '1px solid #c3e6cb',
    borderRadius: '10px',
    padding: '15px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  messageIcon: {
    fontSize: '20px',
    flexShrink: 0
  },
  errorText: {
    color: '#721c24',
    fontSize: '14px',
    whiteSpace: 'pre-line',
    flex: 1
  },
  successText: {
    color: '#155724',
    fontSize: '14px',
    flex: 1
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px'
  },
  inputGroup: {
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
  inputIcon: {
    fontSize: '12px',
    color: 'var(--text-muted)'
  },
  input: {
    padding: '12px',
    border: '2px solid var(--border-color)',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'border-color 0.3s',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    outline: 'none',
    ':focus': {
      borderColor: 'var(--color-patient)'
    },
    ':disabled': {
      backgroundColor: 'var(--bg-tertiary)',
      cursor: 'not-allowed'
    }
  },
  inputError: {
    borderColor: '#e74c3c'
  },
  passwordWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  passwordInput: {
    flex: 1,
    padding: '12px',
    paddingRight: '40px',
    border: '2px solid var(--border-color)',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'border-color 0.3s',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    outline: 'none',
    ':focus': {
      borderColor: 'var(--color-patient)'
    }
  },
  passwordToggle: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    padding: '0',
    ':hover': {
      color: 'var(--text-primary)'
    }
  },
  fieldError: {
    color: '#e74c3c',
    fontSize: '12px',
    marginTop: '3px'
  },
  inputHint: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginTop: '2px'
  },
  strengthContainer: {
    marginTop: '8px'
  },
  strengthBar: {
    height: '4px',
    backgroundColor: 'var(--border-color)',
    borderRadius: '2px',
    overflow: 'hidden',
    marginBottom: '4px'
  },
  strengthFill: {
    height: '100%',
    transition: 'width 0.3s, background-color 0.3s'
  },
  strengthText: {
    fontSize: '11px',
    fontWeight: '500'
  },
  submitButton: {
    backgroundColor: 'var(--color-patient)',
    color: 'white',
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.3s',
    marginTop: '10px',
    ':hover': {
      opacity: 0.9,
      transform: 'translateY(-2px)'
    }
  },
  submitButtonDisabled: {
    backgroundColor: 'var(--text-muted)',
    cursor: 'not-allowed',
    ':hover': {
      backgroundColor: 'var(--text-muted)',
      transform: 'none'
    }
  },
  demoButton: {
    backgroundColor: 'var(--color-admin)',
    color: 'white',
    padding: '12px',
    fontSize: '14px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'background-color 0.3s',
    ':hover': {
      backgroundColor: 'var(--color-admin-soft)'
    }
  },
  spinner: {
    animation: 'spin 1s linear infinite'
  },
  loginContainer: {
    marginTop: '25px',
    textAlign: 'center',
    paddingTop: '20px',
    borderTop: '1px solid var(--border-color)'
  },
  loginText: {
    color: 'var(--text-muted)',
    fontSize: '14px',
    margin: 0
  },
  loginLink: {
    color: 'var(--color-patient)',
    textDecoration: 'none',
    fontWeight: '600',
    ':hover': {
      textDecoration: 'underline'
    }
  },
  termsContainer: {
    marginTop: '15px',
    textAlign: 'center'
  },
  termsText: {
    color: 'var(--text-muted)',
    fontSize: '12px',
    margin: 0,
    lineHeight: '1.5'
  },
  termsLink: {
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    ':hover': {
      textDecoration: 'underline',
      color: 'var(--color-patient)'
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

export default Registro