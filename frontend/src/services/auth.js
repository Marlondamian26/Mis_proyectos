import axios from 'axios'

const API_URL = 'http://127.0.0.1:8000/api/'

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Configura axios para incluir token automáticamente
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000
})

// Interceptor para agregar token a cada petición
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Interceptor para manejar tokens expirados
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    // No redirigir para requests de login/registro
    const noRedirigirUrls = ['/token/', '/token/refresh/', '/registro/', '/doctores-publicos/', '/especialidades-publicas/']
    const isAuthRequest = noRedirigirUrls.some(url => originalRequest.url?.includes(url))
    
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
      originalRequest._retry = true
      
      if (!isRefreshing) {
        isRefreshing = true
        
        try {
          const refreshToken = localStorage.getItem('refresh_token')
          if (!refreshToken) {
            throw new Error('No refresh token')
          }
          
          const response = await axios.post(`${API_URL}token/refresh/`, {
            refresh: refreshToken
          }, { timeout: 5000 })
          
          const newToken = response.data.access
          localStorage.setItem('access_token', newToken)
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          
          processQueue(null, newToken)
          isRefreshing = false
          
          return axiosInstance(originalRequest)
        } catch (refreshError) {
          processQueue(refreshError, null)
          
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user_role')
          
          // Solo redirigir si no estamos ya en login
          if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/registro')) {
            window.location.href = '/login'
          }
          
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      }
      
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
      .then(token => {
        originalRequest.headers.Authorization = `Bearer ${token}`
        return axiosInstance(originalRequest)
      })
      .catch(err => {
        return Promise.reject(err)
      })
    }
    
    return Promise.reject(error)
  }
)

export default axiosInstance