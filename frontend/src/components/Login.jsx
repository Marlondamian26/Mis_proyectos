import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const navigate = useNavigate()

  // Verificar si ya hay sesión activa
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      console.log('Sesión activa detectada, redirigiendo a dashboard')
      navigate('/dashboard')
    }
  }, [navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpiar error cuando el usuario empieza a escribir
    if (error) setError('')
  }

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('El nombre de usuario es requerido')
      return false
    }
    if (!formData.password.trim()) {
      setError('La contraseña es requerida')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validar formulario
    if (!validateForm()) return

    setLoading(true)
    setError('')

    console.log('Intentando login con:', { username: formData.username })

    try {
      // Configurar timeout para la petición
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 segundos timeout

      const response = await axios.post('http://127.0.0.1:8000/api/token/', {
        username: formData.username,
        password: formData.password
      }, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json'
        }
      })

      clearTimeout(timeoutId)

      console.log('Respuesta del servidor:', response.data)

      // Verificar que la respuesta contiene los tokens esperados
      if (response.data && response.data.access) {
        // Guardar tokens
        localStorage.setItem('access_token', response.data.access)
        
        if (response.data.refresh) {
          localStorage.setItem('refresh_token', response.data.refresh)
        }

        // Guardar preferencia de "recordarme"
        if (rememberMe) {
          localStorage.setItem('remember_me', 'true')
        }

        console.log('✅ Login exitoso, tokens guardados')
        
        // Mostrar mensaje de éxito
        setError('') // Limpiar errores
        
        // Redirigir al dashboard
        setTimeout(() => {
          navigate('/dashboard')
        }, 500) // Pequeño delay para mostrar el estado de éxito
      } else {
        console.error('Respuesta inválida del servidor:', response.data)
        setError('Error en la respuesta del servidor')
      }
    } catch (err) {
      console.error('Error detallado:', err)
      
      // Manejar diferentes tipos de error
      if (err.name === 'AbortError' || err.code === 'ECONNABORTED') {
        setError('Tiempo de espera agotado. Verifica que el servidor esté corriendo.')
      } else if (err.response) {
        // El servidor respondió con un error
        console.error('Respuesta de error:', err.response.data)
        console.error('Status:', err.response.status)
        
        if (err.response.status === 401) {
          setError('Usuario o contraseña incorrectos')
        } else if (err.response.status === 400) {
          setError('Datos inválidos. Verifica tu información.')
        } else if (err.response.status === 403) {
          setError('Acceso denegado')
        } else if (err.response.status === 500) {
          setError('Error interno del servidor. Intenta más tarde.')
        } else {
          setError(`Error del servidor: ${err.response.status}`)
        }
      } else if (err.request) {
        // No se recibió respuesta
        console.error('No hubo respuesta del servidor')
        setError('No se pudo conectar con el servidor. Verifica que:\n' +
                 '1️⃣ El backend esté corriendo (python manage.py runserver)\n' +
                 '2️⃣ La URL sea correcta (http://127.0.0.1:8000)\n' +
                 '3️⃣ No haya problemas de CORS')
      } else {
        // Error en la configuración de la petición
        console.error('Error en la petición:', err.message)
        setError('Error al conectar con el servidor: ' + err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDemoAccess = () => {
    // Rellenar con credenciales de demo para pruebas rápidas
    setFormData({
      username: 'belkis_admin',
      password: 'admin123'
    })
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Logo o título */}
        <div style={styles.logoContainer}>
          <h1 style={styles.title}>Belkis-saúde</h1>
          <p style={styles.subtitle}>Sistema de Gestión de Consultorio</p>
        </div>

        {/* Mensaje de éxito si hay login exitoso (opcional) */}
        {!error && loading && (
          <div style={styles.loadingMessage}>
            Iniciando sesión...
          </div>
        )}

        {/* Mensaje de error */}
        {error && (
          <div style={styles.errorContainer}>
            <div style={styles.errorIcon}>⚠️</div>
            <div style={styles.errorText}>{error}</div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Campo Usuario */}
          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="username">
              Usuario
            </label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>👤</span>
              <input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                style={styles.input}
                placeholder="Ingresa tu usuario"
                disabled={loading}
                autoComplete="username"
                autoFocus
              />
            </div>
          </div>

          {/* Campo Contraseña */}
          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="password">
              Contraseña
            </label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>🔒</span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                style={styles.input}
                placeholder="Ingresa tu contraseña"
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.passwordToggle}
                tabIndex="-1"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* Opciones adicionales */}
          <div style={styles.optionsRow}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={styles.checkbox}
              />
              Recordarme
            </label>
            <Link to="/recuperar-password" style={styles.forgotLink}>
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {/* Botón de login */}
          <button 
            type="submit" 
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {})
            }}
            disabled={loading}
          >
            {loading ? (
              <span style={styles.buttonContent}>
                <span style={styles.spinner}></span>
                Iniciando sesión...
              </span>
            ) : (
              <span style={styles.buttonContent}>
                <span>🔑</span>
                Iniciar Sesión
              </span>
            )}
          </button>

          {/* Botón de demo (solo para desarrollo) */}
          {process.env.NODE_ENV === 'development' && (
            <button 
              type="button"
              onClick={handleDemoAccess}
              style={styles.demoButton}
              disabled={loading}
            >
              <span style={styles.buttonContent}>
                <span>🚀</span>
                Usar demo (admin)
              </span>
            </button>
          )}
        </form>

        {/* Enlace a registro */}
        <div style={styles.registerContainer}>
          <p style={styles.registerText}>
            ¿No tienes una cuenta?{' '}
            <Link to="/registro" style={styles.registerLink}>
              Regístrate aquí
            </Link>
          </p>
        </div>

        {/* Información de ayuda */}
        <div style={styles.helpContainer}>
          <details style={styles.helpDetails}>
            <summary style={styles.helpSummary}>
              <span style={styles.helpIcon}>❓</span>
              ¿Problemas para acceder?
            </summary>
            <div style={styles.helpContent}>
              <p style={styles.helpText}>1️⃣ Verifica que el backend esté corriendo:</p>
              <code style={styles.helpCode}>python manage.py runserver</code>
              
              <p style={styles.helpText}>2️⃣ Credenciales por defecto:</p>
              <ul style={styles.helpList}>
                <li>Admin: belkis_admin / admin123</li>
                <li>Paciente: (crea uno nuevo)</li>
              </ul>
              
              <p style={styles.helpText}>3️⃣ Si el problema persiste, revisa la consola (F12)</p>
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}

// Estilos mejorados
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    background: '#f5f7fa',
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '20px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '420px',
    transition: 'transform 0.3s',
    ':hover': {
      transform: 'translateY(-5px)'
    }
  },
  logoContainer: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  title: {
    color: '#2c3e50',
    fontSize: '32px',
    margin: '0 0 5px 0',
    fontWeight: '700'
  },
  subtitle: {
    color: '#7f8c8d',
    fontSize: '14px',
    margin: 0
  },
  loadingMessage: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '12px',
    borderRadius: '10px',
    marginBottom: '20px',
    textAlign: 'center',
    fontSize: '14px',
    border: '1px solid #c3e6cb'
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    border: '1px solid #f5c6cb',
    borderRadius: '10px',
    padding: '12px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  errorIcon: {
    fontSize: '20px'
  },
  errorText: {
    color: '#721c24',
    fontSize: '14px',
    flex: 1,
    whiteSpace: 'pre-line' // Para mensajes multilínea
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  label: {
    color: '#34495e',
    fontSize: '14px',
    fontWeight: '600'
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    fontSize: '16px',
    color: '#95a5a6'
  },
  input: {
    width: '100%',
    padding: '12px 40px',
    fontSize: '15px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    boxSizing: 'border-box',
    transition: 'border-color 0.3s',
    outline: 'none',
    ':focus': {
      borderColor: '#3498db'
    },
    ':disabled': {
      backgroundColor: '#f5f5f5',
      cursor: 'not-allowed'
    }
  },
  passwordToggle: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '0',
    color: '#95a5a6',
    ':hover': {
      color: '#34495e'
    }
  },
  optionsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    color: '#7f8c8d',
    cursor: 'pointer'
  },
  checkbox: {
    width: '16px',
    height: '16px',
    cursor: 'pointer'
  },
  forgotLink: {
    color: '#3498db',
    textDecoration: 'none',
    ':hover': {
      textDecoration: 'underline'
    }
  },
  button: {
    backgroundColor: '#3498db',
    color: 'white',
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'background-color 0.3s, transform 0.1s',
    marginTop: '10px',
    ':hover': {
      backgroundColor: '#2980b9',
      transform: 'translateY(-2px)'
    },
    ':active': {
      transform: 'translateY(0)'
    }
  },
  buttonDisabled: {
    backgroundColor: '#bdc3c7',
    cursor: 'not-allowed',
    ':hover': {
      backgroundColor: '#bdc3c7',
      transform: 'none'
    }
  },
  buttonContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid #ffffff',
    borderTop: '2px solid transparent',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  },
  demoButton: {
    backgroundColor: '#27ae60',
    color: 'white',
    padding: '12px',
    fontSize: '14px',
    fontWeight: '500',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    marginTop: '5px',
    ':hover': {
      backgroundColor: '#219a52'
    }
  },
  registerContainer: {
    marginTop: '25px',
    textAlign: 'center',
    paddingTop: '20px',
    borderTop: '1px solid #ecf0f1'
  },
  registerText: {
    color: '#7f8c8d',
    fontSize: '14px',
    margin: 0
  },
  registerLink: {
    color: '#3498db',
    textDecoration: 'none',
    fontWeight: '600',
    ':hover': {
      textDecoration: 'underline'
    }
  },
  helpContainer: {
    marginTop: '20px'
  },
  helpDetails: {
    fontSize: '13px'
  },
  helpSummary: {
    color: '#95a5a6',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    listStyle: 'none'
  },
  helpIcon: {
    fontSize: '14px'
  },
  helpContent: {
    marginTop: '10px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    fontSize: '12px'
  },
  helpText: {
    color: '#2c3e50',
    margin: '10px 0 5px 0',
    fontWeight: '500'
  },
  helpCode: {
    display: 'block',
    backgroundColor: '#2c3e50',
    color: '#ecf0f1',
    padding: '8px',
    borderRadius: '5px',
    fontSize: '12px',
    fontFamily: 'monospace',
    margin: '5px 0'
  },
  helpList: {
    margin: '5px 0',
    paddingLeft: '20px',
    color: '#7f8c8d'
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

export default Login