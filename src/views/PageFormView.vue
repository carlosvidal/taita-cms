<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/utils/api'
import TipTapEditor from '@/components/TipTapEditor.vue'
import BaseButton from '@/components/BaseButton.vue'
import SlugField from '@/components/SlugField.vue'
import { transitions, rounded, shadows } from '@/styles/designSystem'
import { ArrowLeft, Save } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const isLoading = ref(false)
const isSaving = ref(false)
const error = ref('') // Keep only one declaration of error ref
const page = ref({
  title: '',
  slug: '',
  content: '',
  status: 'draft',
  excerpt: '',
  featuredImage: null,
  existingImage: null,
  removeImage: false
})

// Remove the HTML template code from here
const isEditMode = computed(() => {
  return !!route.params.uuid
})

const pageTitle = computed(() => {
  return isEditMode.value ? 'Editar Página' : 'Crear Página'
})

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

const fetchPage = async (uuid) => {
  isLoading.value = true
  try {
    console.log(`Obteniendo página con UUID: ${uuid}`)
    const response = await api.get(`/api/pages/uuid/${uuid}`)
    
    console.log('Respuesta completa de la API:', response.data)
    
    // Asegurarse de que todos los campos estén presentes
    page.value = {
      ...page.value, // Mantener valores por defecto para campos que no vengan en la respuesta
      ...response.data,
      // Convertir el status del enum (PUBLISHED/DRAFT) a formato legible (published/draft)
      status: response.data.status === 'PUBLISHED' ? 'published' : 'draft',
      // Manejar la imagen existente si hay una
      existingImage: response.data.image || null,
      imageId: response.data.imageId || null,
      removeImage: false
    }
    
    // Depurar información de imagen
    console.log('Información de imagen:', {
      existingImage: page.value.existingImage,
      imageId: page.value.imageId,
      imageFromResponse: response.data.image,
      fullImageUrl: page.value.existingImage ? getFullImageUrl(page.value.existingImage) : ''
    })
    
    console.log('Página cargada:', page.value)
  } catch (err) {
    console.error('Error al obtener página:', err)
    error.value = err.response?.data?.message || err.response?.data?.error || err.message || 'Error al cargar la página'
  } finally {
    isLoading.value = false
  }
}

const handleSubmit = async () => {
  try {
    isSaving.value = true;
    error.value = '';
    console.log('Iniciando guardado de página...');

    // Validate required fields
    if (!page.value.title?.trim()) {
      throw new Error('Title is required');
    }
    if (!page.value.content?.trim()) {
      throw new Error('Content is required');
    }
    if (page.value.excerpt?.length > 160) {
      throw new Error('Excerpt must be 160 characters or less');
    }

    // Get authenticated user ID (replace with your actual auth logic)
    const authUser = JSON.parse(localStorage.getItem('authUser'));
    console.log('Auth user from localStorage:', authUser);
    
    // Si no hay usuario autenticado, usaremos un ID temporal para pruebas
    let authorId = 1; // Valor por defecto
    if (!authUser?.id) {
      console.log('No hay usuario autenticado, usando ID temporal');
    } else {
      authorId = authUser.id;
    }
    
    // Preparar datos para enviar
    const pageData = {
      title: page.value.title,
      content: page.value.content,
      excerpt: page.value.excerpt,
      status: page.value.status,
      authorId: authorId
    };
    
    // Generar un slug único si no se proporciona uno
    if (page.value.slug && page.value.slug.trim() !== '') {
      pageData.slug = page.value.slug.trim();
    } else {
      // Generar slug basado en el título con timestamp para garantizar unicidad
      const timestamp = new Date().getTime().toString().slice(-6);
      const baseSlug = page.value.title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Eliminar caracteres especiales
        .replace(/[\s_-]+/g, '-') // Reemplazar espacios y guiones bajos por guiones
        .replace(/^-+|-+$/g, ''); // Eliminar guiones del principio y final
      
      pageData.slug = `${baseSlug}-${timestamp}`;
      console.log(`Generando slug único: ${pageData.slug}`);
    }
    
    // Si estamos editando y hay una imagen existente, incluirla en los datos
    if (isEditMode.value && page.value.existingImage && !page.value.removeImage) {
      pageData.image = page.value.existingImage;
      if (page.value.imageId) {
        pageData.imageId = page.value.imageId;
      }
    }

    console.log('Enviando datos de página:', pageData);

    let savedPage;
    if (isEditMode.value) {
      console.log(`Enviando PUT a /api/pages/uuid/${route.params.uuid}`);
      const response = await api.put(`/api/pages/uuid/${route.params.uuid}`, pageData);
      console.log('Respuesta del servidor (PUT):', response.data);
      savedPage = response.data;
    } else {
      console.log('Enviando POST a /api/pages');
      const response = await api.post('/api/pages', pageData);
      console.log('Respuesta del servidor (POST):', response.data);
      savedPage = response.data;
    }

    // Si hay una imagen, subirla después de guardar la página
    if (page.value.featuredImage && page.value.featuredImage instanceof File) {
      try {
        console.log('Subiendo imagen destacada...');
        
        // Crear un FormData simple y directo
        const formData = new FormData();
        formData.append('image', page.value.featuredImage);
        formData.append('entityType', 'page');
        formData.append('entityId', savedPage.uuid);

        // Verificar que la imagen se haya adjuntado correctamente
        console.log('FormData entries:', [...formData.entries()]);
        console.log('Imagen a subir:', {
          name: page.value.featuredImage.name,
          type: page.value.featuredImage.type,
          size: page.value.featuredImage.size,
          lastModified: page.value.featuredImage.lastModified
        });

        console.log('Enviando formData:', [...formData.entries()].map(entry => {
          if (entry[0] === 'image') {
            return [entry[0], {
              name: entry[1].name,
              type: entry[1].type,
              size: entry[1].size
            }];
          }
          return entry;
        }));
        
        // Usar fetch nativo para mayor control sobre la solicitud
        const response = await fetch(`${apiBaseUrl.value}/api/media/upload`, {
          method: 'POST',
          body: formData
        });
        
        console.log('Respuesta bruta:', response);
        const responseData = await response.json();
        console.log('Respuesta de carga de imagen:', response.status, responseData);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${JSON.stringify(responseData)}`);
        }

        if (responseData) {
          console.log('Imagen subida exitosamente:', responseData);
          
          // Construir los datos para actualizar la página
          const imageUpdateData = {
            image: responseData.original || responseData.urls?.original,
            imageId: responseData.id
          };
          
          console.log('Actualizando página con datos de imagen:', imageUpdateData);
          
          try {
            // Actualizar la página con la URL de la imagen
            const imageUpdateResponse = await api.put(`/api/pages/uuid/${savedPage.uuid}`, imageUpdateData);
            console.log('Respuesta de actualización de página:', imageUpdateResponse);
            
            // Actualizar también el objeto page local para que se muestre la imagen inmediatamente
            page.value.existingImage = imageUpdateData.image;
            page.value.imageId = imageUpdateData.imageId;
            page.value.removeImage = false;
            
            // Mostrar la URL completa de la imagen para depuración
            console.log('URL completa de la imagen:', getFullImageUrl(imageUpdateData.image));
            
            // Forzar la recarga de la página para asegurarnos de que se muestre la imagen
            await fetchPage(savedPage.uuid);
            
            console.log('Página actualizada con imagen:', imageUpdateResponse.data);
          } catch (updateError) {
            console.error('Error al actualizar la página con la imagen:', updateError);
            throw updateError;
          }
        }
      } catch (imageError) {
        console.error('Error al subir la imagen:', imageError);
        // No interrumpir el flujo si falla la subida de la imagen
      }
    } else if (page.value.removeImage) {
      // Si se solicitó eliminar la imagen
      try {
        await api.put(`/api/pages/uuid/${savedPage.uuid}`, {
          removeImage: true
        });
        console.log('Imagen eliminada exitosamente');
      } catch (removeError) {
        console.error('Error al eliminar la imagen:', removeError);
      }
    }

    router.push('/pages');
  } catch (err) {
    console.error('Error completo:', err);
    error.value = err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      'Error saving page';

    console.error('Page Save Error:', {
      status: err.response?.status,
      data: err.response?.data,
      validationErrors: err.response?.data?.errors,
      message: err.message
    });
  } finally {
    isSaving.value = false;
  }
}

onMounted(async () => {
  // If in edit mode, fetch the page
  if (isEditMode.value) {
    await fetchPage(route.params.uuid)
  }
})

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file type
  if (!file.type.match('image/(jpeg|jpg|png|webp)')) {
    error.value = 'Solo se permiten imágenes JPG, PNG o WebP';
    return;
  }

  // Validate image dimensions
  const img = new Image();
  img.onload = function () {
    if (this.width < 800 || this.height < 600) {
      error.value = `La imagen debe ser de al menos 800×600px (actual: ${this.width}×${this.height}px)`;
      return;
    }
    // Guardar la imagen y resetear el flag de eliminar imagen
    page.value.featuredImage = file;
    page.value.removeImage = false;
  };
  img.onerror = () => {
    error.value = 'Error al cargar la imagen';
  };
  img.src = URL.createObjectURL(file);
};

const removeImage = () => {
  // Marcar la imagen para eliminación
  page.value.featuredImage = null;
  page.value.removeImage = true;
}

/**
 * Verifica si un slug está disponible (no está siendo usado por otra página)
 * @param {string} slug - El slug a verificar
 */
const checkSlugAvailability = async (slug) => {
  if (!slug || (isEditMode.value && page.value.slug === slug)) return;
  
  try {
    const response = await api.get(`/api/pages/check-slug?slug=${encodeURIComponent(slug)}`);
    
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
      <div v-if="error" class="mb-6 p-4 bg-red-50 rounded border border-red-200">
        <p class="text-red-600 font-medium">{{ error }}</p>
      </div>

      <div :class="['bg-white overflow-hidden sm:border sm:border-gray-200 sm:rounded sm:shadow-md']">
        <div class="p-3 sm:p-6 border-b border-gray-200 flex justify-between items-center">
          <h1 class="text-2xl font-bold text-gray-900">{{ pageTitle }}</h1>
          <BaseButton variant="ghost" size="sm" @click="router.push('/pages')">
            <span class="flex items-center whitespace-nowrap">
              <ArrowLeft class="w-4 h-4 mr-2" />
              Volver a páginas
            </span>
          </BaseButton>
        </div>

        <form @submit.prevent="handleSubmit" class="p-3 sm:p-6 space-y-4 sm:space-y-6">
          <!-- Title Input -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input v-model="page.title" required placeholder="Escribe el título de la página"
              class="w-full px-4 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all duration-200">
          </div>

          <!-- Slug Input usando el componente SlugField -->
          <SlugField
            v-model="page.slug"
            :source-text="page.title"
            prefix="/"
            label="Slug"
            placeholder="mi-pagina"
            hint="URL amigable para la página. Se genera automáticamente a partir del título."
            @check-availability="checkSlugAvailability"
          />

          <!-- Espacio reservado para otros campos futuros -->

          <!-- Content Editor -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Contenido</label>
            <TipTapEditor v-model="page.content"
              class="min-h-[200px] border border-gray-300 rounded focus:ring-2 focus:ring-gray-300 overflow-hidden transition-all duration-200" />
          </div>

          <!-- Excerpt Input -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Resumen (máx. 160 caracteres)</label>
            <textarea v-model="page.excerpt" maxlength="160" placeholder="Breve descripción de la página"
              class="w-full px-4 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all duration-200"
              rows="3"></textarea>
            <p class="text-xs text-gray-500 mt-1">{{ page.excerpt?.length || 0 }}/160 caracteres</p>
          </div>

          <!-- Featured Image Upload -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Imagen destacada (JPG/PNG/WebP, min. 800×600px)</label>
            
            <!-- Mostrar imagen existente si hay una -->
            <div v-if="page.existingImage && !page.removeImage" class="mt-2 mb-3">
              <div class="relative w-64 h-40 overflow-hidden rounded border border-gray-200">
                <img :src="getFullImageUrl(page.existingImage)" :alt="`Imagen: ${page.existingImage}`" class="object-cover w-full h-full">
                <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                  {{ page.existingImage }}
                </div>
                <button @click="removeImage" type="button"
                  class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none"
                  title="Eliminar imagen">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div class="mt-2 text-sm text-gray-500">
                ID de imagen: {{ page.imageId }}
              </div>
            </div>
            
            <!-- Selector de nueva imagen -->
            <div v-if="!page.existingImage || page.removeImage" class="mt-1 flex items-center">
              <input type="file" id="featuredImage" accept="image/jpeg,image/png,image/webp" @change="handleImageUpload" class="sr-only">
              <label for="featuredImage"
                class="cursor-pointer rounded-md bg-white py-2 px-3 text-sm font-medium text-gray-700 shadow-sm border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300">
                Seleccionar imagen
              </label>
              <span class="ml-4 text-sm text-gray-500" v-if="page.featuredImage">
                {{ page.featuredImage.name }}
              </span>
            </div>
            
            <!-- Mensaje si la imagen ha sido marcada para eliminación -->
            <div v-if="page.removeImage && !page.featuredImage" class="mt-2 text-sm text-yellow-600">
              La imagen será eliminada al guardar
              <button @click="page.removeImage = false" type="button" class="ml-2 text-blue-600 hover:underline">
                Cancelar
              </button>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex flex-wrap items-center justify-between pt-6 border-t border-gray-100">
            <!-- Status Toggle -->
            <div class="flex items-center mb-4 sm:mb-0">
              <div class="relative inline-block w-14 mr-2 align-middle select-none">
                <input type="checkbox" :checked="page.status === 'published'"
                  @change="page.status = $event.target.checked ? 'published' : 'draft'"
                  class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-2 appearance-none cursor-pointer" />
                <label class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300"></label>
              </div>
              <span :class="{
                'text-sm font-medium': true,
                'text-green-600': page.status === 'published',
                'text-yellow-600': page.status === 'draft'
              }">
                {{ page.status === 'published' ? 'Publicado' : 'Borrador' }}
              </span>
            </div>

            <!-- Buttons -->
            <div class="flex gap-3 ml-auto">
              <BaseButton type="button" variant="secondary" @click="router.push('/pages')" :disabled="isSaving">
                Cancelar
              </BaseButton>
              <BaseButton type="submit" variant="primary" :disabled="isSaving">
                <span class="flex items-center whitespace-nowrap">
                  <svg v-if="isSaving" class="animate-spin mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg"
                    fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                  </svg>
                  <Save v-else class="w-4 h-4 mr-2" />
                  {{ isSaving ? 'Guardando...' : 'Guardar Página' }}
                </span>
              </BaseButton>
            </div>
          </div>
        </form>
      </div>
    </template>
  </div>
</template>
<style scoped>
/* Estilos para el toggle */
.toggle-checkbox {
  position: absolute;
  left: 0;
  top: 0;
  border: 2px solid #CBD5E0;
  transition: all 0.3s ease-in-out;
  z-index: 1;
}

.toggle-checkbox:checked {
  transform: translateX(125%);
  border-color: #68D391;
}

.toggle-checkbox:checked+.toggle-label {
  background-color: #68D391;
}

.toggle-label {
  transition: background-color 0.3s ease-in-out;
}
</style>
