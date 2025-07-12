<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/utils/api'
import TipTapEditor from '@/components/TipTapEditor.vue'
import BaseButton from '@/components/BaseButton.vue'
import SlugField from '@/components/SlugField.vue'
import { transitions, rounded, shadows } from '@/styles/designSystem'
import { ArrowLeft, Save, Library } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const isLoading = ref(false)
const isSaving = ref(false)
const error = ref('')
const series = ref({
  title: '',
  slug: '',
  description: '',
  coverImage: null,
  existingCoverImage: null,
  removeCoverImage: false
})
const posts = ref([]) // Posts asociados a la serie

// Determinar si estamos en modo edición
const isEditMode = computed(() => {
  return !!route.params.uuid
})

// Título dinámico basado en el modo
const pageTitle = computed(() => {
  return isEditMode.value ? 'Editar Serie' : 'Crear Serie'
})

// URL base de la API
const apiBaseUrl = computed(() => {
  return import.meta.env.VITE_API_URL || 'http://localhost:3000'
})

// Función para obtener la URL completa de una imagen
const getFullImageUrl = (path) => {
  if (!path) {
    console.log('getFullImageUrl: path es null o undefined')
    return ''
  }
  
  // Asegurarse de que la ruta no comience con una barra
  const cleanPath = path.startsWith('/') ? path.substring(1) : path
  
  // Construir la URL completa
  const fullUrl = `${apiBaseUrl.value}/${cleanPath}`
  console.log('getFullImageUrl:', { path, cleanPath, fullUrl })
  
  return fullUrl
}

// Cargar datos de la serie si estamos en modo edición
const fetchSeries = async (uuid) => {
  isLoading.value = true
  try {
    console.log(`Obteniendo serie con UUID: ${uuid}`)
    const response = await api.get(`/api/series/uuid/${uuid}`)

    // Asegurarse de que todos los campos estén presentes
    series.value = {
      ...series.value, // Mantener valores por defecto para campos que no vengan en la respuesta
      ...response.data,
      // Manejar la imagen existente si hay una
      existingCoverImage: response.data.coverImage || null,
      removeCoverImage: false
    }

    // Cargar los posts asociados a la serie
    posts.value = response.data.posts || []
    
    // Ordenar los posts por número de secuencia
    posts.value.sort((a, b) => (a.sequenceNumber || 0) - (b.sequenceNumber || 0))

    console.log('Serie cargada:', series.value)
    console.log('Posts asociados:', posts.value)
  } catch (err) {
    console.error('Error al obtener serie:', err)
    error.value = err.response?.data?.message || err.response?.data?.error || err.message || 'Error al cargar la serie'
  } finally {
    isLoading.value = false
  }
}

// Manejar el envío del formulario
const handleSubmit = async () => {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    router.push('/login');
    return;
  }
  
  try {
    isSaving.value = true;
    error.value = '';
    console.log('Iniciando guardado de serie...');

    // Validar campos requeridos
    if (!series.value.title?.trim()) {
      throw new Error('El título es obligatorio');
    }
    if (!series.value.slug?.trim()) {
      throw new Error('El slug es obligatorio');
    }

    // Obtener el usuario autenticado del localStorage
    const authUser = JSON.parse(localStorage.getItem('authUser'));
    console.log('Auth user from localStorage:', authUser);

    if (!authUser?.id) {
      throw new Error('No se pudo obtener la información del usuario autenticado');
    }
    
    const authorId = authUser.id;

    // Preparar los datos para enviar
    const seriesData = {
      title: series.value.title.trim(),
      description: series.value.description?.trim() || '',
      slug: series.value.slug?.trim() || null,
      authorId: parseInt(authorId), // Asegurarse de que sea un número entero
      coverImage: series.value.coverImage || null
    };
    
    console.log('Datos a enviar a la API:', seriesData);
    
    // Guardar la serie
    let savedSeries;
    try {
      if (isEditMode.value) {
        console.log(`Enviando PATCH a /api/series/uuid/${route.params.uuid}`, seriesData);
        const response = await api.patch(`/api/series/uuid/${route.params.uuid}`, seriesData);
        console.log('Respuesta del servidor (PATCH):', response.data);
        savedSeries = response.data;
      } else {
        console.log('Enviando POST a /api/series', seriesData);
        const response = await api.post('/api/series', seriesData);
        console.log('Respuesta del servidor (POST):', response.data);
        savedSeries = response.data;
      }
    } catch (err) {
      console.error('Error al guardar la serie:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText,
        config: {
          url: err.config?.url,
          method: err.config?.method,
          data: err.config?.data
        }
      });
      throw new Error(err.response?.data?.error || err.response?.data?.message || 'Error al guardar la serie');
    }

    // Si hay una imagen, subirla después de guardar la serie
    if (series.value.coverImage && series.value.coverImage instanceof File) {
      try {
        console.log('Subiendo imagen de portada...');
        
        // Crear un FormData
        const formData = new FormData();
        formData.append('image', series.value.coverImage);
        formData.append('entityType', 'series');
        formData.append('entityId', savedSeries.uuid);

        // Verificar que la imagen se haya adjuntado correctamente
        console.log('FormData entries:', [...formData.entries()]);
        console.log('Imagen a subir:', {
          name: series.value.coverImage.name,
          type: series.value.coverImage.type,
          size: series.value.coverImage.size,
          lastModified: series.value.coverImage.lastModified
        });

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
        });
        
        const responseData = await response.json();
        console.log('Respuesta de carga de imagen:', response.status, responseData);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${JSON.stringify(responseData)}`);
        }

        if (responseData) {
          console.log('Imagen subida exitosamente:', responseData);
          
          // Actualizar la serie con la URL de la imagen
          console.log('Actualizando serie con imagen:', {
            uuid: savedSeries.uuid,
            coverImage: responseData.original || responseData.path
          });
          
          try {
            // Usar fetch nativo para actualizar la serie con la imagen
            const updateResponse = await fetch(`${apiBaseUrl.value}/api/series/uuid/${savedSeries.uuid}`, {
              method: 'PATCH', // Cambiado de PUT a PATCH
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                coverImage: responseData.original || responseData.path
              })
            });
            
            const updateResponseData = await updateResponse.json();
            
            if (!updateResponse.ok) {
              throw new Error(`Error ${updateResponse.status}: ${JSON.stringify(updateResponseData)}`);
            }
            
            console.log('Serie actualizada con imagen:', updateResponseData);
          } catch (updateError) {
            console.error('Error al actualizar serie con imagen:', updateError);
            // Aún así, continuamos con el flujo
          }
        }
      } catch (imageError) {
        console.error('Error al subir la imagen:', imageError);
        // No interrumpir el flujo si falla la subida de la imagen
      }
    } else if (series.value.removeCoverImage) {
      // Si se solicitó eliminar la imagen
      try {
        await api.patch(`/api/series/uuid/${savedSeries.uuid}`, { // Cambiado de PUT a PATCH
          coverImage: null
        });
        console.log('Imagen eliminada exitosamente');
      } catch (removeError) {
        console.error('Error al eliminar la imagen:', removeError);
      }
    }

    router.push('/cms/series');

  } catch (err) {
    console.error('Series error:', err);
    console.error('Series error details:', {
      message: err.message,
      response: err.response?.data,
      stack: err.stack
    });
    error.value = err.response?.data?.message || err.message || 'Error al guardar la serie';
  } finally {
    isSaving.value = false;
  }
}

// Verificar disponibilidad del slug
const checkSlugAvailability = async (slug) => {
  if (!slug || (isEditMode.value && series.value.slug === slug)) return;
  
  try {
    const response = await api.get(`/api/series/check-slug?slug=${encodeURIComponent(slug)}`);
    
    if (response.data.exists) {
      // El slug ya está en uso, mostrar mensaje de error
      error.value = `El slug "${slug}" ya está en uso. Por favor, elige otro.`;
      return false;
    } else {
      // El slug está disponible
      error.value = '';
      return true;
    }
  } catch (err) {
    console.error('Error al verificar disponibilidad del slug:', err);
    // No mostrar error al usuario, simplemente devolver true para no bloquear
    return true;
  }
};

// Manejar la subida de imágenes
const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validar tipo de archivo
  if (!file.type.match('image/(jpeg|jpg|png|webp)')) {
    error.value = 'Solo se permiten imágenes JPG, PNG o WebP';
    return;
  }

  // Validar tamaño del archivo (5MB máximo)
  if (file.size > 5 * 1024 * 1024) {
    error.value = 'La imagen no debe superar los 5MB';
    return;
  }

  // Validar dimensiones de la imagen
  const img = new Image();
  img.onload = function () {
    if (this.width < 800 || this.height < 600) {
      error.value = `La imagen debe ser de al menos 800×600px (actual: ${this.width}×${this.height}px)`;
      return;
    }
    // Guardar la imagen y resetear el flag de eliminar imagen
    series.value.coverImage = file;
    series.value.removeCoverImage = false;
  };
  img.onerror = () => {
    error.value = 'Error al cargar la imagen';
  };
  img.src = URL.createObjectURL(file);
};

// Eliminar la imagen
const removeImage = () => {
  // Marcar la imagen para eliminación
  series.value.coverImage = null;
  series.value.removeCoverImage = true;
};

// Cargar datos al montar el componente
onMounted(async () => {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    router.push('/login');
    return;
  }

  // Si estamos en modo edición, cargar la serie
  if (isEditMode.value) {
    await fetchSeries(route.params.uuid);
  }
});
</script>

<template>
  <div class="max-w-4xl mx-auto py-4 px-2 sm:py-8 sm:px-6 lg:px-8">
    <!-- Loading state -->
    <div v-if="isLoading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-800 mx-auto"></div>
      <p class="mt-4 text-gray-600">Cargando...</p>
    </div>

    <template v-else>
      <!-- Error message -->
      <div v-if="error" class="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
        <p class="text-red-600 font-medium">{{ error }}</p>
      </div>

      <div :class="['bg-white overflow-hidden sm:border sm:border-gray-200 sm:rounded sm:shadow-md']">
        <div class="p-3 sm:p-6 border-b border-gray-200 flex justify-between items-center">
          <h1 class="text-2xl font-bold text-gray-900">{{ pageTitle }}</h1>
        </div>

        <form @submit.prevent="handleSubmit" class="p-3 sm:p-6 space-y-4 sm:space-y-6">
          <!-- Title Input -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input v-model="series.title" required placeholder="Escribe el título de la serie"
              class="w-full px-4 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all duration-200">
          </div>

          <!-- Slug Input usando el componente SlugField -->
          <SlugField
            v-model="series.slug"
            :source-text="series.title"
            prefix="/series/"
            label="Slug"
            placeholder="mi-serie"
            hint="URL amigable para la serie. Se genera automáticamente a partir del título."
            @check-availability="checkSlugAvailability"
          />

          <!-- Description Input -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea v-model="series.description" placeholder="Describe brevemente de qué trata esta serie"
              class="w-full px-4 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all duration-200"
              rows="3"></textarea>
          </div>

          <!-- Cover Image Upload -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Imagen de portada (JPG/PNG/WebP, min. 800×600px)</label>
            
            <!-- Mostrar imagen existente si hay una -->
            <div v-if="series.existingCoverImage && !series.removeCoverImage" class="mt-2 mb-3">
              <div class="relative w-64 h-40 overflow-hidden rounded border border-gray-200">
                <img :src="getFullImageUrl(series.existingCoverImage)" :alt="`Imagen: ${series.existingCoverImage}`" class="object-cover w-full h-full">
                <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                  {{ series.existingCoverImage }}
                </div>
                <button @click="removeImage" type="button"
                  class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none"
                  title="Eliminar imagen">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <!-- Selector de nueva imagen -->
            <div v-if="!series.existingCoverImage || series.removeCoverImage" class="mt-1 flex items-center">
              <input type="file" id="coverImage" accept="image/jpeg,image/png,image/webp" @change="handleImageUpload" class="sr-only">
              <label for="coverImage"
                class="cursor-pointer rounded-md bg-white py-2 px-3 text-sm font-medium text-gray-700 shadow-sm border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300">
                Seleccionar imagen
              </label>
              <span class="ml-4 text-sm text-gray-500" v-if="series.coverImage">
                {{ series.coverImage.name }}
              </span>
            </div>
            
            <!-- Mensaje si la imagen ha sido marcada para eliminación -->
            <div v-if="series.removeCoverImage && !series.coverImage" class="mt-2 text-sm text-yellow-600">
              La imagen será eliminada al guardar
              <button @click="series.removeCoverImage = false" type="button" class="ml-2 text-blue-600 hover:underline">
                Cancelar
              </button>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex flex-wrap items-center justify-between pt-6 border-t border-gray-100">
            <BaseButton
              variant="secondary"
              @click="router.push('/cms/series')"
              class="mb-4 sm:mb-0"
            >
              <span class="flex items-center">
                <ArrowLeft class="w-4 h-4 mr-2" />
                Volver
              </span>
            </BaseButton>

            <BaseButton
              variant="primary"
              type="submit"
              :disabled="isSaving"
              :class="{ 'opacity-70 cursor-not-allowed': isSaving }"
            >
              <span class="flex items-center">
                <Save class="w-4 h-4 mr-2" />
                {{ isSaving ? 'Guardando...' : 'Guardar' }}
              </span>
            </BaseButton>
          </div>
        </form>
      </div>

      <!-- Posts asociados a la serie (solo en modo edición) -->
      <div v-if="isEditMode && posts.length > 0" class="mt-8">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Posts en esta serie</h2>
        
        <div class="bg-white overflow-hidden sm:border sm:border-gray-200 sm:rounded sm:shadow-md">
          <ul class="divide-y divide-gray-200">
            <li v-for="post in posts" :key="post.id" class="p-4 flex items-center justify-between">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-8 w-8 bg-gray-100 rounded flex items-center justify-center text-gray-500">
                  <span class="text-sm font-medium">{{ post.sequenceNumber || '?' }}</span>
                </div>
                <div class="ml-3">
                  <div class="text-sm font-medium text-gray-900">{{ post.title }}</div>
                  <div class="text-xs text-gray-500">{{ post.slug }}</div>
                </div>
              </div>
              
              <div class="flex gap-2">
                <button
                  @click="router.push(`/posts/${post.uuid}`)"
                  class="text-gray-500 hover:text-gray-700"
                  title="Editar post"
                >
                  <Edit class="w-4 h-4" />
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </template>
  </div>
</template>
