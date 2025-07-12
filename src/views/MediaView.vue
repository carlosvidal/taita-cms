<script setup>
import { ref, onMounted, computed } from 'vue'
import ViewLayout from '@/views/ViewLayout.vue'
import BaseButton from '@/components/BaseButton.vue'
import api from '@/utils/api'
import { Plus, Trash2, Download, ExternalLink } from 'lucide-vue-next'

const mediaItems = ref([])
const isLoading = ref(false)
const error = ref(null)
const showUploadModal = ref(false)
const uploadFile = ref(null)
const isUploading = ref(false)
const uploadError = ref(null)

// URL base para las imágenes
const apiBaseUrl = computed(() => {
  return import.meta.env.VITE_API_URL || 'http://localhost:3000'
})

// Función para obtener la URL completa de una imagen
const getFullImageUrl = (path) => {
  if (!path) return ''
  return `${apiBaseUrl.value}/${path}`
}

// Obtener todas las imágenes
const fetchMedia = async () => {
  isLoading.value = true
  error.value = null
  try {
    const response = await api.get('/api/media')
    
    // Procesar las URLs para asegurarnos de que sean correctas
    mediaItems.value = response.data.map(item => {
      // Asegurarse de que las URLs no sean undefined
      if (item.urls) {
        // Verificar si las URLs ya tienen la base URL
        Object.keys(item.urls).forEach(key => {
          if (item.urls[key] && !item.urls[key].startsWith('http')) {
            // Solo añadir la base URL si no la tiene ya
            console.log(`Corrigiendo URL para ${key}:`, item.urls[key])
          }
        })
      }
      return item
    })
    
    console.log('Media items loaded:', mediaItems.value)
  } catch (err) {
    console.error('Error loading media:', err)
    error.value = err.response?.data?.message || 
                 err.response?.data?.error || 
                 err.message || 
                 'Error al cargar las imágenes'
  } finally {
    isLoading.value = false
  }
}

// Manejar la selección de archivo
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  // Validar tipo de archivo
  if (!file.type.match('image/(jpeg|jpg|png|webp)')) {
    uploadError.value = 'Solo se permiten imágenes JPG, PNG o WebP'
    return
  }
  
  // Validar tamaño del archivo (máximo 5MB)
  if (file.size > 5 * 1024 * 1024) {
    uploadError.value = 'La imagen no debe superar los 5MB'
    return
  }
  
  uploadFile.value = file
  uploadError.value = null
}

// Subir imagen
const uploadImage = async () => {
  if (!uploadFile.value) {
    uploadError.value = 'Selecciona una imagen para subir'
    return
  }
  
  isUploading.value = true
  uploadError.value = null
  
  try {
    const formData = new FormData()
    formData.append('image', uploadFile.value)
    formData.append('entityType', 'general')
    
    console.log('Subiendo imagen:', {
      nombre: uploadFile.value.name,
      tipo: uploadFile.value.type,
      tamaño: uploadFile.value.size
    })
    
    // Usar fetch nativo con autenticación
    const token = localStorage.getItem('authToken')
    if (!token) {
      throw new Error('Token de autenticación no encontrado')
    }
    
    const response = await fetch(`${apiBaseUrl.value}/api/media/upload`, {
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
    
    console.log('Imagen subida exitosamente:', responseData)
    
    // Actualizar la lista de imágenes
    await fetchMedia()
    
    // Cerrar modal
    closeUploadModal()
  } catch (err) {
    console.error('Error al subir imagen:', err)
    uploadError.value = err.message || 'Error al subir la imagen'
  } finally {
    isUploading.value = false
  }
}

// Eliminar imagen
const deleteImage = async (id) => {
  if (!confirm('¿Estás seguro de que deseas eliminar esta imagen? Esta acción no se puede deshacer.')) {
    return
  }
  
  try {
    await api.delete(`/api/media/${id}`)
    await fetchMedia()
  } catch (err) {
    console.error('Error deleting image:', err)
    error.value = err.response?.data?.message || 
                 err.response?.data?.error || 
                 err.message || 
                 'Error al eliminar la imagen'
  }
}

// Formatear fecha
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// Formatear tamaño de archivo
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  else return (bytes / 1048576).toFixed(1) + ' MB'
}

// Abrir modal de subida
const openUploadModal = () => {
  showUploadModal.value = true
  uploadFile.value = null
  uploadError.value = null
}

// Cerrar modal de subida
const closeUploadModal = () => {
  showUploadModal.value = false
  uploadFile.value = null
  uploadError.value = null
}

// Copiar URL al portapapeles
const copyToClipboard = (url) => {
  console.log('Copiando URL al portapapeles:', url)
  
  navigator.clipboard.writeText(url)
    .then(() => {
      alert('URL copiada al portapapeles')
    })
    .catch(err => {
      console.error('Error al copiar URL:', err)
    })
}

onMounted(() => {
  fetchMedia()
})
</script>

<template>
  <ViewLayout>
    <template #title>Biblioteca de Medios</template>
    <template #subtitle>Gestiona las imágenes de tu sitio</template>

    <div class="flex justify-between items-center mb-6">
      <div>
        <p v-if="mediaItems.length" class="text-gray-500 text-sm">
          {{ mediaItems.length }} {{ mediaItems.length === 1 ? 'imagen' : 'imágenes' }} encontradas
        </p>
      </div>

      <BaseButton variant="primary" @click="openUploadModal">
        <template #icon>
          <Plus class="w-4 h-4" />
        </template>
        Subir Imagen
      </BaseButton>
    </div>

    <div v-if="isLoading" class="py-8 text-center text-gray-500">
      <div class="animate-pulse flex justify-center">
        <div class="h-4 w-24 bg-panel rounded"></div>
      </div>
      <p class="mt-2 text-sm">Cargando imágenes...</p>
    </div>

    <div v-else-if="!mediaItems.length" class="py-12 text-center">
      <div class="text-gray-400 mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-700 mb-1">No se encontraron imágenes</h3>
      <p class="text-gray-500 text-sm">Sube tu primera imagen para comenzar</p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-for="item in mediaItems" :key="item.id" class="bg-panel rounded-lg border border-panel overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div class="relative h-48 overflow-hidden bg-panel">
          <img v-if="item.urls?.original" :src="getFullImageUrl(item.urls.original)" :alt="item.originalName" class="w-full h-full object-cover">
          <div v-else class="flex items-center justify-center h-full bg-panel">
            <span class="text-gray-500">Sin imagen</span>
          </div>
          <div class="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
            <div class="flex space-x-2">
              <button v-if="item.urls?.original" @click="copyToClipboard(getFullImageUrl(item.urls.original))" class="p-2 bg-panel rounded-full text-gray-700 hover:text-blue-600 transition-colors">
                <ExternalLink class="w-5 h-5" />
              </button>
              <button @click="deleteImage(item.id)" class="p-2 bg-panel rounded-full text-gray-700 hover:text-red-600 transition-colors">
                <Trash2 class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        <div class="p-4">
          <p class="text-sm font-medium text-gray-700 truncate" :title="item.originalName">
            {{ item.originalName }}
          </p>
          <p class="text-xs text-gray-500 mt-1">
            {{ formatDate(item.createdAt) }}
          </p>
          <div class="flex justify-between items-center mt-3">
            <span class="text-xs bg-panel text-gray-600 px-2 py-1 rounded">
              {{ item.entityType || 'general' }}
            </span>
            <button v-if="item.urls?.original" @click="copyToClipboard(getFullImageUrl(item.urls.original))" class="text-xs text-blue-600 hover:text-blue-800">
              Copiar URL
            </button>
            <span v-else class="text-xs text-gray-400">Sin URL</span>
          </div>
          <div class="mt-2 text-xs text-gray-500">
            <p class="truncate"><span class="font-medium">Tipo:</span> {{ item.entityType || 'general' }}</p>
            <p class="truncate"><span class="font-medium">Fecha:</span> {{ formatDate(item.createdAt) }}</p>
            <p class="truncate"><span class="font-medium">ID:</span> {{ item.id }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Modal -->
    <div v-if="showUploadModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-panel rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Subir nueva imagen</h3>
        
        <div v-if="uploadError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
          {{ uploadError }}
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Selecciona una imagen (JPG, PNG o WebP, máx. 5MB)
          </label>
          <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div class="space-y-1 text-center">
              <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <div class="flex text-sm text-gray-600">
                <label for="file-upload" class="relative cursor-pointer bg-panel rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                  <span>Subir un archivo</span>
                  <input id="file-upload" name="file-upload" type="file" class="sr-only" accept="image/jpeg,image/png,image/webp" @change="handleFileSelect">
                </label>
                <p class="pl-1">o arrastra y suelta</p>
              </div>
              <p class="text-xs text-gray-500">
                JPG, PNG, WebP hasta 5MB
              </p>
            </div>
          </div>
          <div v-if="uploadFile" class="mt-2 text-sm text-gray-600">
            Archivo seleccionado: {{ uploadFile.name }} ({{ formatFileSize(uploadFile.size) }})
          </div>
        </div>
        
        <div class="flex justify-end space-x-3">
          <button 
            @click="closeUploadModal" 
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-panel border border-gray-300 rounded-md shadow-sm hover:bg-panel"
            :disabled="isUploading"
          >
            Cancelar
          </button>
          <button 
            @click="uploadImage" 
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none"
            :disabled="isUploading || !uploadFile"
          >
            <span v-if="isUploading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Subiendo...
            </span>
            <span v-else>Subir imagen</span>
          </button>
        </div>
      </div>
    </div>
  </ViewLayout>
</template>
