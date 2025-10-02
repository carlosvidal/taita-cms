<template>
  <ViewLayout>
    <template #title>{{ isEditMode ? 'Editar Usuario' : 'Nuevo Usuario' }}</template>
    <template #subtitle>{{ isEditMode ? 'Actualiza la información del perfil' : 'Crea un nuevo perfil de usuario' }}</template>

    <div class="space-y-6">
      <!-- Indicador de carga -->
      <div v-if="isLoading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>

      <div v-else class="space-y-8">
        <!-- Formulario de información de perfil -->
        <form @submit.prevent="handleProfileSubmit" class="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Información de perfil</h3>

          <!-- Sección de foto de perfil -->
          <div class="flex items-start space-x-6">
            <div class="flex-shrink-0">
              <div v-if="previewImage || user.picture" class="relative w-24 h-24 rounded-full overflow-hidden">
                <img
                  :src="previewImage || getImageUrl(user.picture)"
                  alt="Foto de perfil"
                  class="w-full h-full object-cover"
                />
                <button
                  type="button"
                  @click="removeImage"
                  class="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                  title="Eliminar imagen"
                >
                  <X class="w-3 h-3" />
                </button>
              </div>
              <div v-else class="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                <UserCircle class="w-12 h-12" />
              </div>
            </div>

            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-2">Foto de perfil</label>
              <input
                type="file"
                ref="fileInput"
                @change="handleFileChange"
                accept="image/*"
                class="hidden"
              />
              <div class="flex flex-col space-y-2">
                <BaseButton
                  type="button"
                  @click="$refs.fileInput.click()"
                  variant="secondary"
                  size="sm"
                  class="w-fit"
                >
                  Seleccionar imagen
                </BaseButton>
                <p class="text-xs text-gray-500">
                  Formatos permitidos: JPG, PNG, GIF. Tamaño máximo: 5MB
                </p>
              </div>
            </div>
          </div>

          <!-- Información básica -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label for="name" class="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                id="name"
                v-model="user.name"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nombre completo"
                required
              />
            </div>

            <div class="space-y-2">
              <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                v-model="user.email"
                :disabled="isEditMode"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                placeholder="ejemplo@dominio.com"
                required
              />
              <p v-if="isEditMode" class="text-xs text-gray-500">
                El email no se puede modificar
              </p>
            </div>
          </div>

          <!-- Selección de rol (solo visible para crear nuevo usuario y si es admin) -->
          <div v-if="!isEditMode && isAdmin" class="space-y-2">
            <label for="role" class="block text-sm font-medium text-gray-700">Rol</label>
            <select
              id="role"
              v-model="user.role"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="AUTHOR">Autor</option>
              <option value="ADMIN">Administrador</option>
            </select>
            <p class="text-xs text-gray-500">
              Los administradores tienen acceso completo al CMS.
            </p>
          </div>

          <!-- Mostrar rol en modo edición (solo lectura) -->
          <div v-if="isEditMode" class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Rol</label>
            <div class="text-gray-900 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
              {{ user.role === 'ADMIN' ? 'Administrador' : 'Autor' }}
            </div>
          </div>

          <!-- Biografía -->
          <div class="space-y-2">
            <label for="bio" class="block text-sm font-medium text-gray-700">Biografía</label>
            <textarea
              id="bio"
              v-model="user.bio"
              rows="4"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Escribe una breve biografía..."
            ></textarea>
          </div>

          <!-- Botones de acción -->
          <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <BaseButton
              type="button"
              @click="router.push('/cms/users')"
              variant="secondary"
            >
              Cancelar
            </BaseButton>
            <BaseButton
              type="submit"
              :disabled="isSavingProfile"
              variant="primary"
            >
              <span v-if="isSavingProfile">Guardando...</span>
              <span v-else>{{ isEditMode ? 'Actualizar Perfil' : 'Crear Usuario y Establecer Contraseña' }}</span>
            </BaseButton>
          </div>
        </form>

        <!-- Formulario de contraseña (solo en modo crear o si estamos editando) -->
        <form v-if="!isEditMode" @submit.prevent="handleProfileSubmit" class="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Contraseña</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label for="password" class="block text-sm font-medium text-gray-700">Contraseña</label>
              <input
                type="password"
                id="password"
                v-model="passwords.password"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Contraseña"
                required
              />
            </div>

            <div class="space-y-2">
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirmar contraseña</label>
              <input
                type="password"
                id="confirmPassword"
                v-model="passwords.confirmPassword"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Confirma la contraseña"
                required
              />
            </div>
          </div>

          <p v-if="passwordError" class="text-sm text-red-600">
            {{ passwordError }}
          </p>
        </form>

        <!-- Formulario de cambio de contraseña (solo en modo edición) -->
        <form v-if="isEditMode" @submit.prevent="handlePasswordSubmit" class="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Cambiar contraseña</h3>
          <p class="text-sm text-gray-600 mb-4">Deja los campos vacíos si no deseas cambiar tu contraseña.</p>

          <div class="space-y-2">
            <label for="currentPassword" class="block text-sm font-medium text-gray-700">Contraseña actual</label>
            <input
              type="password"
              id="currentPassword"
              v-model="passwords.currentPassword"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Introduce tu contraseña actual"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label for="newPassword" class="block text-sm font-medium text-gray-700">Nueva contraseña</label>
              <input
                type="password"
                id="newPassword"
                v-model="passwords.password"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nueva contraseña"
              />
            </div>

            <div class="space-y-2">
              <label for="confirmNewPassword" class="block text-sm font-medium text-gray-700">Confirmar nueva contraseña</label>
              <input
                type="password"
                id="confirmNewPassword"
                v-model="passwords.confirmPassword"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Confirma la nueva contraseña"
              />
            </div>
          </div>

          <p v-if="passwordError" class="text-sm text-red-600">
            {{ passwordError }}
          </p>

          <!-- Botones de acción -->
          <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <BaseButton
              type="button"
              @click="resetPasswordForm"
              variant="secondary"
            >
              Cancelar
            </BaseButton>
            <BaseButton
              type="submit"
              :disabled="isSavingPassword || !passwords.currentPassword || !passwords.password"
              variant="primary"
            >
              <span v-if="isSavingPassword">Actualizando...</span>
              <span v-else>Actualizar Contraseña</span>
            </BaseButton>
          </div>
        </form>
      </div>

      <!-- Mensaje de éxito -->
      <div v-if="showSuccess" class="fixed bottom-4 right-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md shadow-md z-50">
        <div class="flex items-center">
          <svg class="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>{{ successMessage }}</span>
        </div>
      </div>
    </div>
  </ViewLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import ViewLayout from '@/views/ViewLayout.vue'
import BaseButton from '@/components/BaseButton.vue'
import { UserCircle, X } from 'lucide-vue-next'
import api from '@/utils/api'

// Usuario actual (para verificar permisos)
const currentUser = ref(null)

const router = useRouter()
const route = useRoute()
const fileInput = ref(null)

// Estado
const isLoading = ref(false)
const isSavingProfile = ref(false)
const isSavingPassword = ref(false)
const showSuccess = ref(false)
const successMessage = ref('')
const passwordError = ref('')
const previewImage = ref(null)
const selectedFile = ref(null)

// Datos del usuario
const user = ref({
  name: '',
  email: '',
  bio: '',
  picture: '',
  role: 'AUTHOR'
})

// Contraseñas
const passwords = ref({
  currentPassword: '',
  password: '',
  confirmPassword: ''
})

// Comprobar si estamos en modo edición
const isEditMode = computed(() => {
  return route.params.uuid !== undefined
})

// Comprobar si el usuario actual es administrador
const isAdmin = computed(() => {
  return currentUser.value && currentUser.value.role === 'ADMIN'
})

// Función para obtener la URL completa de una imagen
const getImageUrl = (path) => {
  if (!path) return null

  // Si la ruta ya es una URL completa, devolverla
  if (path.startsWith('http')) return path

  // Si no, construir la URL completa
  return `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${path}`
}

// Cargar datos del usuario actual desde localStorage
const loadCurrentUser = () => {
  try {
    const userData = localStorage.getItem('authUser')
    if (userData) {
      currentUser.value = JSON.parse(userData)
      console.log('Usuario actual cargado:', currentUser.value)
    }
  } catch (error) {
    console.error('Error al cargar datos de usuario actual:', error)
  }
}

// Cargar datos del usuario si estamos en modo edición
const fetchUser = async () => {
  if (!isEditMode.value) return

  isLoading.value = true
  try {
    console.log('Intentando cargar usuario con UUID:', route.params.uuid)
    const response = await api.get(`/api/users/uuid/${route.params.uuid}`)
    const userData = response.data

    // Actualizar datos del usuario
    user.value = {
      name: userData.name || '',
      email: userData.email || '',
      bio: userData.bio || '',
      picture: userData.picture || '',
      role: userData.role || 'AUTHOR'
    }

    console.log('Usuario cargado:', user.value)
  } catch (error) {
    console.error('Error al cargar usuario:', error)
    router.push('/cms/users')
  } finally {
    isLoading.value = false
  }
}

// Manejar cambio de archivo
const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Verificar tamaño (5MB máximo)
  if (file.size > 5 * 1024 * 1024) {
    alert('La imagen es demasiado grande. El tamaño máximo permitido es 5MB.')
    event.target.value = ''
    return
  }

  // Verificar tipo de archivo
  if (!file.type.match('image.*')) {
    alert('Solo se permiten archivos de imagen.')
    event.target.value = ''
    return
  }

  // Guardar el archivo seleccionado
  selectedFile.value = file

  // Crear URL para vista previa
  const reader = new FileReader()
  reader.onload = (e) => {
    previewImage.value = e.target.result
  }
  reader.readAsDataURL(file)
}

// Eliminar imagen
const removeImage = () => {
  previewImage.value = null
  selectedFile.value = null
  if (fileInput.value) fileInput.value.value = ''

  // Si estamos en modo edición y hay una imagen existente, marcarla para eliminar
  if (isEditMode.value && user.value.picture) {
    user.value.picture = null
  }
}

// Resetear formulario de contraseña
const resetPasswordForm = () => {
  passwords.value = {
    currentPassword: '',
    password: '',
    confirmPassword: ''
  }
  passwordError.value = ''
}

// Validar contraseñas
const validatePasswords = () => {
  passwordError.value = ''

  // Si no se ha introducido contraseña, retornar true (no es obligatorio en edición)
  if (!passwords.value.password) {
    return true
  }

  // Verificar que las contraseñas coinciden
  if (passwords.value.password !== passwords.value.confirmPassword) {
    passwordError.value = 'Las contraseñas no coinciden'
    return false
  }

  // Verificar longitud mínima
  if (passwords.value.password.length < 6) {
    passwordError.value = 'La contraseña debe tener al menos 6 caracteres'
    return false
  }

  // En modo edición, verificar que se haya proporcionado la contraseña actual
  if (isEditMode.value && passwords.value.password && !passwords.value.currentPassword) {
    passwordError.value = 'Debes introducir tu contraseña actual para cambiarla'
    return false
  }

  return true
}

// Subir imagen de perfil
const uploadProfilePicture = async (uuid) => {
  if (!selectedFile.value) return null

  const formData = new FormData()
  formData.append('picture', selectedFile.value)

  try {
    console.log('Subiendo imagen de perfil...')

    // Obtener el token de autenticación
    const token = localStorage.getItem('authToken')

    // Usar fetch nativo en lugar de axios
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const url = `${apiBaseUrl}/api/users/uuid/${uuid}/picture`

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    const responseData = await response.json()
    console.log('Respuesta de carga de imagen:', response.status, responseData)

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${JSON.stringify(responseData)}`)
    }

    console.log('Imagen de perfil subida exitosamente:', responseData)
    return responseData
  } catch (error) {
    console.error('Error al subir imagen de perfil:', error)
    throw error
  }
}

// Enviar formulario de perfil
const handleProfileSubmit = async () => {
  // Si no estamos en modo edición, validar contraseñas también
  if (!isEditMode.value && !validatePasswords()) {
    return
  }

  isSavingProfile.value = true

  try {
    let userData

    if (isEditMode.value) {
      // Modo edición: actualizar solo información de perfil
      const updateData = {
        name: user.value.name,
        bio: user.value.bio
      }

      // Actualizar usuario
      const response = await api.patch(`/api/users/uuid/${route.params.uuid}`, updateData)
      userData = response.data

      // Si se ha seleccionado una nueva imagen, subirla
      if (selectedFile.value) {
        const imageResponse = await uploadProfilePicture(route.params.uuid)

        // Recargar los datos del usuario para obtener la nueva URL de la imagen
        await fetchUser()

        // Limpiar la previsualización y archivo seleccionado
        previewImage.value = null
        selectedFile.value = null
        if (fileInput.value) fileInput.value.value = ''
      }

      successMessage.value = 'Perfil actualizado correctamente'
    } else {
      // Modo creación: crear nuevo usuario con contraseña
      const createData = {
        name: user.value.name,
        email: user.value.email,
        password: passwords.value.password,
        bio: user.value.bio,
        role: isAdmin.value ? user.value.role : 'AUTHOR'
      }

      // Crear usuario
      const response = await api.post('/api/users', createData)
      userData = response.data

      // Si se ha seleccionado una imagen, subirla
      if (selectedFile.value && userData.uuid) {
        await uploadProfilePicture(userData.uuid)
      }

      successMessage.value = 'Usuario creado correctamente'

      // Redirigir después de crear
      showSuccess.value = true
      setTimeout(() => {
        showSuccess.value = false
        router.push('/cms/users')
      }, 2000)

      return
    }

    // Mostrar mensaje de éxito (solo para modo edición, ya que creación redirige)
    showSuccess.value = true
    setTimeout(() => {
      showSuccess.value = false
    }, 3000)

    console.log('Usuario guardado:', userData)
  } catch (error) {
    console.error('Error al guardar usuario:', error)

    // Mostrar mensaje de error
    if (error.response && error.response.data && error.response.data.error) {
      alert(error.response.data.error)
    } else {
      alert('Error al guardar usuario. Por favor, inténtalo de nuevo.')
    }
  } finally {
    isSavingProfile.value = false
  }
}

// Enviar formulario de contraseña (solo en modo edición)
const handlePasswordSubmit = async () => {
  // Validar contraseñas
  if (!validatePasswords()) return

  isSavingPassword.value = true

  try {
    const updateData = {
      password: passwords.value.password,
      currentPassword: passwords.value.currentPassword
    }

    // Actualizar contraseña
    await api.patch(`/api/users/uuid/${route.params.uuid}`, updateData)

    // Resetear formulario de contraseña
    resetPasswordForm()

    // Mostrar mensaje de éxito
    successMessage.value = 'Contraseña actualizada correctamente'
    showSuccess.value = true
    setTimeout(() => {
      showSuccess.value = false
    }, 3000)

    console.log('Contraseña actualizada')
  } catch (error) {
    console.error('Error al actualizar contraseña:', error)

    // Mostrar mensaje de error
    if (error.response && error.response.data && error.response.data.error) {
      passwordError.value = error.response.data.error
    } else {
      passwordError.value = 'Error al actualizar contraseña. Por favor, inténtalo de nuevo.'
    }
  } finally {
    isSavingPassword.value = false
  }
}

onMounted(() => {
  loadCurrentUser()
  fetchUser()
})
</script>
