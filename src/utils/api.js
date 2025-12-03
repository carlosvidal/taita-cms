import axios from 'axios'
import { useRouter } from 'vue-router'

// Determinar la URL de la API basada en el entorno
const isProduction = window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1');

// Usar variable de entorno o fallback
let apiUrl = import.meta.env.VITE_API_URL || (isProduction ? 'https://backend.taita.blog' : 'http://localhost:3001');

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
export const setupResponseInterceptors = (router) => {
  apiClient.interceptors.response.use(
    response => response,
    error => {
      if (error.response) {
        console.error(`[api.js] Error ${error.response.status} - ${error.response.statusText}`);
        
        // Manejar errores de autenticación (401) y permisos (403)
        if (error.response.status === 401 || error.response.status === 403) {
          console.error('[api.js] Error de autenticación/permisos. Redirigiendo a login...');
          
          // Limpiar datos de autenticación
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
          
          // Redirigir a login con hash mode
          if (window.location.pathname !== '/login') {
            window.location.href = '/#/login';
          }
        }
      }
      return Promise.reject(error);
    }
  );
};

// Exportar la instancia de apiClient y los métodos
export { apiClient };

export const api = {
  get: (url, config) => apiClient.get(url, config),
  post: (url, data, config) => apiClient.post(url, data, config),
  put: (url, data, config) => apiClient.put(url, data, config),
  patch: (url, data, config) => apiClient.patch(url, data, config),
  delete: (url, config) => apiClient.delete(url, config),
  // Exponer la instancia de Axios y la URL base
  client: apiClient,
  baseURL: apiUrl
}

export default api