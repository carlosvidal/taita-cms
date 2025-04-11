import axios from 'axios'
import { useRouter } from 'vue-router'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para añadir el token de autenticación a cada solicitud
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor para manejar errores de autenticación
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Si recibimos un error 401 (no autorizado), redirigimos al login
      localStorage.removeItem('authToken')
      // Usamos window.location en lugar de router para forzar un refresh completo
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default {
  get: (url) => apiClient.get(url),
  post: (url, data) => apiClient.post(url, data),
  put: (url, data) => apiClient.put(url, data),
  delete: (url) => apiClient.delete(url)
}