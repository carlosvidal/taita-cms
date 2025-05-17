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
  timeout: 10000 // 10 segundos de timeout
})

// Interceptor para añadir el token de autenticación a cada solicitud
apiClient.interceptors.request.use(
  (config) => {
    // No añadir el token para las rutas públicas
    const publicEndpoints = ['/api/auth/login', '/api/auth/register'];
    if (publicEndpoints.some(endpoint => config.url.endsWith(endpoint))) {
      return config;
    }
    
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Añadiendo token a la solicitud:', config.url);
    } else {
      console.warn('No se encontró token de autenticación para la solicitud:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('Error en la configuración de la solicitud:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (!error.response) {
      console.error('Error de red o servidor no disponible:', error);
      return Promise.reject({
        message: 'No se pudo conectar al servidor. Verifica tu conexión a internet.'
      });
    }

    const { status, data } = error.response;
    
    // Manejar errores de autenticación
    if (status === 401 || status === 403) {
      console.warn('Error de autenticación/permisos:', data);
      
      // Solo redirigir si no estamos ya en la página de login
      if (!window.location.pathname.includes('login')) {
        // Limpiar datos de autenticación
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        
        // Redirigir al login con parámetro de sesión expirada
        const redirectUrl = window.location.pathname.includes('/cms/') 
          ? '/login?sessionExpired=true' 
          : '/#/login?sessionExpired=true';
        
        window.location.href = redirectUrl;
      }
    }
    
    // Proporcionar un mensaje de error más descriptivo
    const errorMessage = data?.error || data?.message || `Error en la solicitud (${status})`;
    return Promise.reject(new Error(errorMessage));
  }
);

// Exportar la instancia de apiClient y los métodos
export { apiClient };

export const api = {
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