import axios from 'axios'
import { useRouter } from 'vue-router'

// Determinar la URL de la API basada en el entorno
let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Si estamos en producción (dominio taita.blog), usar siempre la URL de producción
if (window.location.hostname.includes('taita.blog')) {
  apiUrl = 'https://api.taita.blog';
  console.log('Usando API de producción:', apiUrl);
} else {
  console.log('Usando API configurada:', apiUrl);
}

const apiClient = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para añadir el token de autenticación a cada solicitud
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    //console.log('[api.js] Enviando token:', token)
    //console.log('[api.js] Header Authorization:', config.headers.Authorization)
  } else {
    //console.warn('[api.js] No se encontró token en localStorage')
  }
  return config
})

// Interceptor para manejar errores de autenticación
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      console.error('[api.js] Error 401 - No autorizado. Headers enviados:', error.config.headers)
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
  patch: (url, data) => apiClient.patch(url, data),
  delete: (url) => apiClient.delete(url)
}