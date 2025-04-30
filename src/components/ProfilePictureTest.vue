<template>
  <div class="profile-picture-test">
    <h2>Prueba de carga de imagen de perfil</h2>
    
    <div class="form-group">
      <label for="picture">Seleccionar imagen:</label>
      <input 
        type="file" 
        id="picture" 
        @change="handleFileChange" 
        accept="image/*"
      >
    </div>
    
    <div v-if="previewImage" class="preview-container">
      <h3>Vista previa:</h3>
      <img :src="previewImage" alt="Vista previa" class="preview-image">
    </div>
    
    <button 
      @click="uploadImage" 
      :disabled="!selectedFile"
      class="btn btn-primary mt-3 bg-blue-600 text-white hover:bg-blue-700"
    >
      Subir imagen
    </button>
    
    <div v-if="message" class="alert" :class="messageType">
      {{ message }}
    </div>
    
    <div v-if="uploadedImageUrl" class="uploaded-image-container">
      <h3>Imagen subida:</h3>
      <img :src="uploadedImageUrl" alt="Imagen subida" class="uploaded-image">
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../utils/api'

// UUID del usuario (normalmente vendría de props o store)
const userUuid = ref('8494d4b3-f4e5-44e3-a929-e607c9746b6a') // UUID de ejemplo

// Estado
const selectedFile = ref(null)
const previewImage = ref(null)
const message = ref('')
const messageType = ref('alert-info')
const uploadedImageUrl = ref('')

// Manejar cambio de archivo
const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  // Verificar tamaño (5MB máximo)
  if (file.size > 5 * 1024 * 1024) {
    message.value = 'La imagen es demasiado grande. El tamaño máximo permitido es 5MB.'
    messageType.value = 'alert-danger'
    event.target.value = ''
    return
  }
  
  // Verificar tipo de archivo
  if (!file.type.match('image.*')) {
    message.value = 'Solo se permiten archivos de imagen.'
    messageType.value = 'alert-danger'
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
  
  // Limpiar mensaje anterior
  message.value = ''
}

// Subir imagen
const uploadImage = async () => {
  if (!selectedFile.value) {
    message.value = 'Por favor selecciona una imagen primero.'
    messageType.value = 'alert-warning'
    return
  }
  
  try {
    message.value = 'Subiendo imagen...'
    messageType.value = 'alert-info'
    
    // Crear FormData
    const formData = new FormData()
    formData.append('picture', selectedFile.value)
    
    console.log('Subiendo imagen a la ruta de prueba')
    console.log('Contenido del FormData:', [...formData.entries()])
    console.log('Tipo de archivo:', selectedFile.value.type)
    console.log('Tamaño de archivo:', selectedFile.value.size)
    
    // Obtener el token de autenticación
    const token = localStorage.getItem('authToken')
    
    // Usar fetch nativo en lugar de axios
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const url = `${apiBaseUrl}/api/profile-picture-test/upload/${userUuid.value}`
    
    console.log('URL completa:', url)
    
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    const responseData = await response.json()
    console.log('Respuesta del servidor:', response.status, responseData)
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${JSON.stringify(responseData)}`)
    }
    
    message.value = 'Imagen subida con éxito!'
    messageType.value = 'alert-success'
    
    // Mostrar la imagen subida
    if (responseData.user && responseData.user.picture) {
      uploadedImageUrl.value = `${apiBaseUrl}${responseData.user.picture}`
    }
  } catch (error) {
    console.error('Error al subir imagen:', error)
    message.value = `Error al subir imagen: ${error.message}`
    messageType.value = 'alert-danger'
  }
}
</script>

<style scoped>
.profile-picture-test {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.form-group {
  margin-bottom: 20px;
}

.preview-container,
.uploaded-image-container {
  margin-top: 20px;
  text-align: center;
}

.preview-image,
.uploaded-image {
  max-width: 100%;
  max-height: 300px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.alert {
  padding: 10px;
  margin-top: 20px;
  border-radius: 4px;
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert-danger {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.alert-warning {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeeba;
}

.alert-info {
  background-color: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.btn-primary {
  background-color: #007bff;
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: #0069d9;
}

.btn-primary:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.mt-3 {
  margin-top: 15px;
}
</style>
