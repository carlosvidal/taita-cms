<template>
  <ViewLayout>
    <template #title>{{ isEditMode ? $t('users.editUser') : $t('users.newUser') }}</template>
    <template #subtitle>{{ isEditMode ? $t('users.updateProfile') : $t('users.createUserAndPassword') }}</template>

    <div class="space-y-6">
      <!-- Indicador de carga -->
      <div v-if="isLoading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>

      <div v-else class="space-y-8">
        <!-- Formulario de información de perfil -->
        <form @submit.prevent="handleProfileSubmit" class="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('users.profileInfo') }}</h3>

          <!-- Sección de foto de perfil -->
          <div class="flex items-start space-x-6">
            <div class="flex-shrink-0">
              <div v-if="previewImage || user.picture" class="relative w-24 h-24 rounded-full overflow-hidden">
                <img
                  :src="previewImage || getImageUrl(user.picture)"
                  :alt="$t('users.profilePicture')"
                  class="w-full h-full object-cover"
                />
                <button
                  type="button"
                  @click="removeImage"
                  class="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                  :title="$t('common.delete')"
                >
                  <X class="w-3 h-3" />
                </button>
              </div>
              <div v-else class="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                <UserCircle class="w-12 h-12" />
              </div>
            </div>

            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('users.profilePicture') }}</label>
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
                  {{ $t('users.selectImage') }}
                </BaseButton>
                <p class="text-xs text-gray-500">
                  {{ $t('users.allowedFormats') }}
                </p>
              </div>
            </div>
          </div>

          <!-- Información básica -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label for="name" class="block text-sm font-medium text-gray-700">{{ $t('common.name') }}</label>
              <input
                type="text"
                id="name"
                v-model="user.name"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                :placeholder="$t('users.userName')"
                required
              />
            </div>

            <div class="space-y-2">
              <label for="email" class="block text-sm font-medium text-gray-700">{{ $t('common.email') }}</label>
              <input
                type="email"
                id="email"
                v-model="user.email"
                :disabled="isEditMode"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                :placeholder="$t('users.userEmail')"
                required
              />
              <p v-if="isEditMode" class="text-xs text-gray-500">
                {{ $t('users.emailCannotBeChanged') }}
              </p>
            </div>
          </div>

          <!-- Selección de rol (solo visible para crear nuevo usuario y si es admin) -->
          <div v-if="!isEditMode && isAdmin" class="space-y-2">
            <label for="role" class="block text-sm font-medium text-gray-700">{{ $t('users.role') }}</label>
            <select
              id="role"
              v-model="user.role"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="AUTHOR">{{ $t('users.author') }}</option>
              <option value="ADMIN">{{ $t('users.admin') }}</option>
            </select>
            <p class="text-xs text-gray-500">
              {{ $t('users.adminAccessInfo') }}
            </p>
          </div>

          <!-- Mostrar rol en modo edición (solo lectura) -->
          <div v-if="isEditMode" class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">{{ $t('users.role') }}</label>
            <div class="text-gray-900 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
              {{ user.role === 'ADMIN' ? $t('users.admin') : $t('users.author') }}
            </div>
          </div>

          <!-- Biografía -->
          <div class="space-y-2">
            <label for="bio" class="block text-sm font-medium text-gray-700">{{ $t('users.userBio') }}</label>
            <textarea
              id="bio"
              v-model="user.bio"
              rows="4"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              :placeholder="$t('users.bioPlaceholder')"
            ></textarea>
          </div>

          <!-- Botones de acción -->
          <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <BaseButton
              type="button"
              @click="router.push('/cms/users')"
              variant="secondary"
            >
              {{ $t('common.cancel') }}
            </BaseButton>
            <BaseButton
              type="submit"
              :disabled="isSavingProfile"
              variant="primary"
            >
              <span v-if="isSavingProfile">{{ $t('common.saving') }}</span>
              <span v-else>{{ isEditMode ? $t('users.updateProfile') : $t('users.createUserAndPassword') }}</span>
            </BaseButton>
          </div>
        </form>

        <!-- Formulario de contraseña (solo en modo crear o si estamos editando) -->
        <form v-if="!isEditMode" @submit.prevent="handleProfileSubmit" class="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('common.password') }}</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label for="password" class="block text-sm font-medium text-gray-700">{{ $t('common.password') }}</label>
              <input
                type="password"
                id="password"
                v-model="passwords.password"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                :placeholder="$t('common.password')"
                required
              />
            </div>

            <div class="space-y-2">
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700">{{ $t('users.confirmPassword') }}</label>
              <input
                type="password"
                id="confirmPassword"
                v-model="passwords.confirmPassword"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                :placeholder="$t('users.confirmPassword')"
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
          <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('users.changePassword') }}</h3>
          <p class="text-sm text-gray-600 mb-4">{{ $t('users.passwordHint') }}</p>

          <div class="space-y-2">
            <label for="currentPassword" class="block text-sm font-medium text-gray-700">{{ $t('users.currentPassword') }}</label>
            <input
              type="password"
              id="currentPassword"
              v-model="passwords.currentPassword"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              :placeholder="$t('users.currentPassword')"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label for="newPassword" class="block text-sm font-medium text-gray-700">{{ $t('users.newPassword') }}</label>
              <input
                type="password"
                id="newPassword"
                v-model="passwords.password"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                :placeholder="$t('users.newPassword')"
              />
            </div>

            <div class="space-y-2">
              <label for="confirmNewPassword" class="block text-sm font-medium text-gray-700">{{ $t('users.confirmPassword') }}</label>
              <input
                type="password"
                id="confirmNewPassword"
                v-model="passwords.confirmPassword"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                :placeholder="$t('users.confirmPassword')"
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
              {{ $t('common.cancel') }}
            </BaseButton>
            <BaseButton
              type="submit"
              :disabled="isSavingPassword || !passwords.currentPassword || !passwords.password"
              variant="primary"
            >
              <span v-if="isSavingPassword">{{ $t('common.saving') }}</span>
              <span v-else>{{ $t('users.updatePasswordBtn') }}</span>
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
import { useI18n } from 'vue-i18n'
import ViewLayout from '@/views/ViewLayout.vue'
import BaseButton from '@/components/BaseButton.vue'
import { UserCircle, X } from 'lucide-vue-next'
import api from '@/utils/api'

const { t } = useI18n()

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
  id: null,
  uuid: null,
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
      id: userData.id,
      uuid: userData.uuid,
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
    passwordError.value = t('users.passwordsDoNotMatch')
    return false
  }

  // Verificar longitud mínima
  if (passwords.value.password.length < 6) {
    passwordError.value = t('users.passwordTooShort')
    return false
  }

  // En modo edición, verificar que se haya proporcionado la contraseña actual
  if (isEditMode.value && passwords.value.password && !passwords.value.currentPassword) {
    passwordError.value = t('users.currentPasswordRequired')
    return false
  }

  return true
}

// Subir imagen de perfil
const uploadProfilePicture = async (userId, userUuid) => {
  if (!selectedFile.value) return null

  try {
    console.log('Subiendo imagen de perfil...')

    // Crear FormData con la estructura que espera el endpoint de media
    const formData = new FormData()
    formData.append('image', selectedFile.value)
    formData.append('entityType', 'user')
    formData.append('entityId', userUuid)

    // Obtener el token de autenticación
    const token = localStorage.getItem('authToken')
    if (!token) {
      throw new Error(t('errors.authTokenNotFound'))
    }

    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

    // Subir imagen a /api/media/upload
    const response = await fetch(`${apiBaseUrl}/api/media/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })

    const responseData = await response.json()
    console.log('Respuesta de carga de imagen:', response.status, responseData)

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${JSON.stringify(responseData)}`)
    }

    // Extraer datos de la imagen
    const mediaData = responseData.media || responseData
    console.log('Media data extraída:', mediaData)

    // Actualizar el usuario con la URL de la imagen
    const imageUpdateData = {
      picture: mediaData.url || mediaData.path,
      pictureId: mediaData.id
    }

    console.log('Actualizando usuario con imagen:', imageUpdateData)

    // Actualizar usuario con la nueva imagen usando ID numérico
    const updateResponse = await fetch(`${apiBaseUrl}/api/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(imageUpdateData)
    })

    const updateResponseData = await updateResponse.json()

    if (!updateResponse.ok) {
      throw new Error(`Error ${updateResponse.status}: ${JSON.stringify(updateResponseData)}`)
    }

    console.log('Usuario actualizado con imagen:', updateResponseData)
    return updateResponseData
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

      // Actualizar usuario usando ID numérico
      const response = await api.patch(`/api/users/${user.value.id}`, updateData)
      userData = response.data

      // Si se ha seleccionado una nueva imagen, subirla
      if (selectedFile.value) {
        const imageResponse = await uploadProfilePicture(user.value.id, user.value.uuid)

        // Recargar los datos del usuario para obtener la nueva URL de la imagen
        await fetchUser()

        // Limpiar la previsualización y archivo seleccionado
        previewImage.value = null
        selectedFile.value = null
        if (fileInput.value) fileInput.value.value = ''
      }

      successMessage.value = t('users.profileUpdated')
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
      if (selectedFile.value && userData.id && userData.uuid) {
        await uploadProfilePicture(userData.id, userData.uuid)
      }

      successMessage.value = t('users.saveSuccess')

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

    // Actualizar contraseña usando ID numérico
    await api.patch(`/api/users/${user.value.id}`, updateData)

    // Resetear formulario de contraseña
    resetPasswordForm()

    // Mostrar mensaje de éxito
    successMessage.value = t('users.passwordUpdated')
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
