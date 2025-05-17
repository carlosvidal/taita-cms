<template>
  <div class="login-form-container">
    <div class="login-card">
      <div class="login-header">
        <h1 class="login-title">CMS</h1>
        <p class="login-subtitle">Inicia sesión para acceder al panel de administración</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div class="form-group">
          <label for="email" class="form-label">Email</label>
          <input id="email" v-model="email" type="email" placeholder="tu@email.com" class="form-input" required
            :disabled="isLoading">
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Contraseña</label>
          <input id="password" v-model="password" type="password" placeholder="••••••••" class="form-input" required
            :disabled="isLoading">
        </div>

        <button type="submit" class="login-button" :disabled="isLoading">
          <span v-if="isLoading" class="loading-spinner"></span>
          <span v-else>Iniciar sesión</span>
        </button>

        <div class="forgot-link mt-2 text-center">
          <router-link to="/forgot-password" class="text-blue-600 hover:underline">¿Olvidaste tu
            contraseña?</router-link>
        </div>

        <!-- Credenciales de prueba -->
        <div class="test-credentials">
          <p>Credenciales de prueba:</p>
          <code>Email: admin@example.com</code>
          <code>Contraseña: securepassword</code>
        </div>
      </form>
      <div class="signup-link mt-4 text-center">
        <span>¿No tienes cuenta?</span>
        <router-link to="/signup" class="text-blue-600 hover:underline ml-1">Regístrate</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../utils/api'

export default {
  setup() {
    const router = useRouter()
    const email = ref('')
    const password = ref('')
    const error = ref('')
    const isLoading = ref(false)

    const handleLogin = async () => {
      error.value = ''
      isLoading.value = true

      try {
        console.log('Iniciando proceso de login...', { email: email.value });
        
        // Validar campos requeridos
        if (!email.value || !password.value) {
          throw new Error('Por favor ingresa tu correo y contraseña');
        }
        
        // Usar la instancia de api configurada en api.js
        const response = await api.post('/api/auth/login', {
          email: email.value.trim(),
          password: password.value
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: false  // Deshabilitar el envío automático de credenciales
        }).catch(err => {
          console.error('Error en la petición de login:', err);
          
          // Manejar errores de red
          if (err.code === 'ECONNABORTED') {
            throw new Error('El servidor está tardando demasiado en responder. Por favor, verifica tu conexión.');
          }
          
          // Manejar errores de respuesta HTTP
          if (err.response) {
            console.error('Respuesta del servidor:', err.response.data);
            
            if (err.response.status === 401) {
              throw new Error('Correo o contraseña incorrectos');
            } else if (err.response.status >= 500) {
              throw new Error('Error en el servidor. Por favor, inténtalo más tarde.');
            } else if (err.response.data && err.response.data.error) {
              throw new Error(err.response.data.error);
            }
          }
          
          throw new Error('Error de conexión. Por favor, verifica tu conexión a internet.');
        });

        const data = response.data;
        console.log('Respuesta del servidor:', { success: data.success, user: data.user?.email });

        if (!data.success) {
          throw new Error(data.error || 'Error en la autenticación. Por favor, verifica tus credenciales.');
        }

        if (!data.token || !data.user) {
          throw new Error('Respuesta del servidor incompleta. Por favor, intenta nuevamente.');
        }

        try {
          // Guardar el token JWT y los datos del usuario por separado
          const userData = {
            id: data.user.id,
            uuid: data.user.uuid,
            email: data.user.email,
            name: data.user.name || 'Usuario',
            role: data.user.role || 'AUTHOR'
          };
          
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('authUser', JSON.stringify(userData));

          console.log('Usuario autenticado exitosamente:', userData);
          
          // Redirigir según el rol
          const redirectRoute = userData.role === 'SUPER_ADMIN' 
            ? { name: 'super-admin-blogs' } 
            : { name: 'dashboard' };
            
          console.log('Redirigiendo a:', redirectRoute);
          router.push(redirectRoute);
          
        } catch (storageError) {
          console.error('Error al guardar los datos de sesión:', storageError);
          throw new Error('Error al iniciar sesión. Por favor, verifica la configuración de tu navegador.');
        }

      } catch (err) {
        console.error('Error en handleLogin:', {
          message: err.message,
          name: err.name,
          stack: err.stack
        });
        error.value = err.message || 'Error inesperado al iniciar sesión. Por favor, inténtalo de nuevo.';
      } finally {
        isLoading.value = false;
      }
    }

    return {
      email,
      password,
      error,
      isLoading,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-form-container {
  width: 100%;
  max-width: 400px;
}

.login-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  width: 100%;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
}

.login-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-input {
  padding: 0.625rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.login-button {
  background-color: #2563eb;
  color: white;
  font-weight: 500;
  padding: 0.625rem 1rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 2.5rem;
}

.login-button:hover {
  background-color: #1d4ed8;
}

.login-button:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}

.error-message {
  background-color: #fee2e2;
  color: #b91c1c;
  padding: 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.loading-spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

.test-credentials {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
  text-align: center;
  font-size: 0.75rem;
  color: #6b7280;
}

.test-credentials p {
  margin-bottom: 0.5rem;
}

.test-credentials code {
  display: block;
  padding: 0.25rem;
  background-color: #f3f4f6;
  border-radius: 0.25rem;
  margin-bottom: 0.25rem;
  font-family: monospace;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>