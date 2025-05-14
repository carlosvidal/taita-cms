import axios from 'axios'
import { useRouter } from 'vue-router'

// Siempre usar la URL de la API en Render.com para producción
// Esto asegura que no importa desde dónde se acceda, siempre se use la misma URL
const isProduction = window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1');

// Determinar la URL de la API basada en el entorno
let apiUrl = 'https://taita-api.onrender.com'; // Forzar siempre a usar la URL de producción

console.log(`Ambiente: ${isProduction ? 'Producción' : 'Desarrollo'}, Usando API: ${apiUrl}`);
console.log('Hostname actual:', window.location.hostname);

// Configuración de Axios con tiempo de espera aumentado
const apiClient = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000, // 10 segundos de timeout
  withCredentials: true // Incluir cookies en las solicitudes cross-origin
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
      // Importar y usar router directamente no funciona bien en interceptores
      // En su lugar, usamos hash mode para la navegación
      window.location.href = '/#/login'
    }
    return Promise.reject(error)
  }
)

// Exportar la instancia de apiClient y los métodos
const api = {
  get: (url) => apiClient.get(url),
  post: (url, data) => apiClient.post(url, data),
  put: (url, data) => apiClient.put(url, data),
  patch: (url, data) => apiClient.patch(url, data),
  delete: (url) => apiClient.delete(url),
  // Exponer la instancia de Axios y la URL base
  client: apiClient,
  baseURL: apiUrl
}

export default api