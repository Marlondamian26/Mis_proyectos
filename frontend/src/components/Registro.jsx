import React, { useState } from 'react'
// use the shared axios instance for auth and token handling
import axiosInstance from '../services/auth'
import { useNavigate, Link } from 'react-router-dom'
import { 
  FaUser, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash,
  FaCheckCircle, FaExclamationTriangle, FaSpinner, FaUserPlus
} from 'react-icons/fa'
import { APP_NAME, APP_SLOGAN } from '../config/constants'
import { useLanguage } from '../context/LanguageContext'

function Registro() {
  const { t } = useLanguage()
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
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, message: '', color: '#e74c3c' })
  // Evitar que el componente se desmonte durante el registro
  const [isSubmitting, setIsSubmitting] = useState(false)
  
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
      message = t('passwordEmpty')
      color = '#95a5a6'
    } else if (score <= 2) {
      message = t('passwordWeak')
      color = '#e74c3c'
    } else if (score <= 3) {
      message = t('passwordMedium')
      color = '#f39c12'
    } else if (score <= 4) {
      message = t('passwordStrong')
      color = '#27ae60'
    } else {
      message = t('passwordVeryStrong')
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
      newErrors.username = 'O nome de usuario e obrigatorio'
    } else if (formData.username.length < 3) {
      newErrors.username = 'O usuario deve ter pelo menos 3 caracteres'
    }

    // Validar senha
    if (!formData.password) {
      newErrors.password = 'A senha e obrigatoria'
    } else if (formData.password.length < 4) {
      newErrors.password = 'A senha deve ter pelo menos 4 caracteres'
    }

    // Validar nombre
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'O nome e obrigatorio'
    }

    // Validar apellido
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'O sobrenome e obrigatorio'
    }

    // Validar email (opcional para pacientes, obligatorio para otros roles)
    if (formData.rol !== 'patient' && !formData.email.trim()) {
      newErrors.email = 'O email e obrigatorio'
    } else if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalido'
    }

    // Validar teléfono (opcional pero con formato)
    if (formData.telefono && !/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(formData.telefono)) {
      newErrors.telefono = 'Formato de telefone invalido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Prevenir múltiples envíos
    if (isSubmitting || loading) {
      return
    }
    
    // Validar formulario
    if (!validateForm()) {
      setError('Por favor corrija os erros no formulario')
      return
    }

    setIsSubmitting(true)
    setLoading(true)
    setError('')
    setSuccess('')

    console.log('Enviando registro:', formData)

    try {
      // Configurar timeout más largo (60s) para evitar cancelaciones
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000)

      // usar axiosInstance para respetar la configuración común
      const response = await axiosInstance.post(
        'registro/', 
        formData,
        {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 60000  // timeout adicional de axios
        }
      )

      clearTimeout(timeoutId)

      console.log('Respuesta del servidor:', response.data)
      
      setSuccess('Cadastro realizado com sucesso! Acessando sua conta...')
      
      // Salvar tokens se o registro retornar tokens
      if (response.data.access) {
        localStorage.setItem('access_token', response.data.access)
        localStorage.setItem('refresh_token', response.data.refresh)
        // redirigir al dashboard para que complete su información
        setTimeout(() => navigate('/dashboard'), 1500)
      } else {
        setTimeout(() => navigate('/login'), 1500)
      }
    } catch (err) {
      console.error('Error detallado:', err)

      // Axios produces different error shapes for cancellations/timeouts.
      if (err?.name === 'AbortError' || err?.name === 'CanceledError' || err?.code === 'ECONNABORTED' || err?.code === 'ERR_CANCELED') {
        setError('Tempo limite excedido ou requisicao cancelada. Verifique se o servidor esta funcionando.')
      } else if (err.response) {
        // Errores del servidor
        console.error('Error response:', err.response.data)
        
        if (err.response.status === 400) {
          // Errores de validación del backend
          const backendErrors = err.response.data
          
          if (typeof backendErrors === 'object') {
            // Mostrar erros especificos do backend
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
              setError('Erro nos dados enviados')
            }
          } else {
            setError(backendErrors.message || 'Erro no cadastro')
          }
        } else if (err.response.status === 409) {
          setError('O nome de usuario ja existe')
          setErrors(prev => ({
            ...prev,
            username: 'Este usuario ja esta cadastrado'
          }))
        } else {
          setError(`Erro do servidor: ${err.response.status}`)
        }
      } else if (err.request) {
        setError('Nao foi possivel conectar com o servidor. Verifique se o backend esta funcionando.')
      } else {
        setError('Erro ao conectar com o servidor')
      }
    } finally {
      setLoading(false)
      setIsSubmitting(false)
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
    <div style={styles.container} className="fade-in-scale slide-in-top">
      <div style={styles.card}>
        {/* Logo y título */}
        <div style={styles.header}>
          <FaUserPlus style={styles.headerIcon} />
          <h1 style={styles.title}>{APP_NAME}</h1>
          <p style={styles.subtitle}>{t('createAccount')}</p>
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
            <span style={styles.inputHint}>Minimo 3 caracteres</span>
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
              Telefone
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
              Senha *
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
            
            <span style={styles.inputHint}>Minimo 4 caracteres</span>
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
                {t('createAccount')}
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
              🚀 Carregar dados de demo
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
            Ao se cadastrar, voce aceita nossos{' '}
            <a href="/terminos" style={styles.termsLink}>Termos e Condicoes</a>{' '}
            e{' '}
            <a href="/privacidade" style={styles.termsLink}>Politica de Privacidade</a>
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
    backgroundColor: 'var(--color-error-bg)',
    border: '1px solid var(--color-error)',
    borderRadius: '10px',
    padding: '15px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  successContainer: {
    backgroundColor: 'var(--color-success-bg)',
    border: '1px solid var(--color-success)',
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