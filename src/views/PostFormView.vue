<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/utils/api'
import TipTapEditor from '@/components/TipTapEditor.vue'
import BaseButton from '@/components/BaseButton.vue'
import SlugField from '@/components/SlugField.vue'
import { transitions, rounded, shadows } from '@/styles/designSystem'
import { Save, Library } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const isLoading = ref(false)
const isSaving = ref(false)
const post = ref({
  title: '',
  slug: '',
  content: '',
  status: 'draft',
  excerpt: '',
  featuredImage: null,
  existingImage: null,
  removeImage: false,
  author: '', // Add author field
  categoryId: null, // Add categoryId field
  seriesId: null, // Add seriesId field
  sequenceNumber: null // Add sequenceNumber field
})

// Remove the HTML template code from here
const error = ref('')
const categories = ref([])
const series = ref([])

const isEditMode = computed(() => {
  return !!route.params.id
})

const postTitle = computed(() => {
  return isEditMode.value ? 'Editar Post' : 'Crear Post'
})

const apiBaseUrl = computed(() => {
  return import.meta.env.VITE_API_URL || 'http://localhost:3000'
})

// Función para obtener la URL completa de una imagen
const getFullImageUrl = (path) => {
  if (!path) return ''
  return `${apiBaseUrl.value}/${path}`
}

const fetchPost = async (uuid) => {
  isLoading.value = true
  try {
    console.log(`Obteniendo post con UUID: ${uuid}`)
    const response = await api.get(`/api/posts/uuid/${uuid}`)

    // Asegurarse de que todos los campos estén presentes
    post.value = {
      ...post.value, // Mantener valores por defecto para campos que no vengan en la respuesta
      ...response.data,
      // Asegurarse de que el estado sea 'draft' o 'published'
      status: response.data.status?.toLowerCase() === 'published' ? 'published' : 'draft',
      // Manejar la imagen existente si hay una
      existingImage: response.data.image || null,
      removeImage: false,
      // Extraer el ID de categoría si existe
      categoryId: response.data.category?.id || null,
      // Extraer información de la serie si existe
      seriesId: response.data.series?.id || null,
      sequenceNumber: response.data.sequenceNumber || null
    }

    console.log('Post cargado:', post.value)
  } catch (err) {
    console.error('Error al obtener post:', err)
    error.value = err.response?.data?.message || err.response?.data?.error || err.message || 'Error al cargar el post'
  } finally {
    isLoading.value = false
  }
}

const handleSubmit = async () => {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    router.push('/login');
    return;
  }

  try {
    isSaving.value = true;
    error.value = '';
    console.log('Iniciando guardado de post...');

    // Validate required fields
    if (!post.value.title?.trim()) {
      throw new Error('Title is required');
    }
    if (!post.value.content?.trim()) {
      throw new Error('Content is required');
    }
    if (post.value.excerpt?.length > 160) {
      throw new Error('Excerpt must be 160 characters or less');
    }

    // Get authenticated user ID (replace with your actual auth logic)
    const authUser = JSON.parse(localStorage.getItem('authUser'));
    console.log('Auth user from localStorage:', authUser);

    // Si no hay usuario autenticado, usaremos un ID temporal para pruebas
    let authorId;
    if (!authUser?.id) {
      console.log('No hay usuario autenticado, usando ID temporal');
      authorId = 1; // ID temporal para pruebas
    } else {
      authorId = authUser.id;
    }

    // Obtener el blogId del localStorage (necesario para la API)
    const activeBlog = localStorage.getItem('activeBlog');
    if (!activeBlog) {
      throw new Error('No hay un blog seleccionado. Por favor, seleccione un blog primero.');
    }
    
    // Prepare payload with simplified structure
    const postData = {
      title: post.value.title.trim(),
      content: post.value.content.trim(),
      excerpt: post.value.excerpt?.trim() || '',
      slug: post.value.slug?.trim() || null,
      // Convertir el status a mayúsculas para que coincida con el enum PublishStatus
      status: (post.value.status === 'published' ? 'PUBLISHED' : 'DRAFT'),
      authorId: authorId, // Usar el ID que determinamos anteriormente
      blogId: activeBlog // Incluir el blogId (UUID del blog activo)
    };
    
    console.log('Datos del post a enviar:', postData);

    // Add category if selected
    if (post.value.categoryId) {
      postData.categoryId = post.value.categoryId;
      console.log('Agregando categoría al post:', post.value.categoryId);
    }

    // Add series if selected
    if (post.value.seriesId) {
      postData.seriesId = post.value.seriesId;
      if (post.value.sequenceNumber) {
        postData.sequenceNumber = parseInt(post.value.sequenceNumber);
      }
      console.log('Agregando serie al post:', { seriesId: post.value.seriesId, sequenceNumber: post.value.sequenceNumber });
    }

    // Primero guardar el post sin imagen
    let savedPost;
    if (isEditMode.value) {
      console.log(`Enviando PUT a /api/posts/uuid/${route.params.id}`);
      const response = await api.put(`/api/posts/uuid/${route.params.id}`, postData);
      console.log('Respuesta del servidor (PUT):', response.data);
      savedPost = response.data;
    } else {
      console.log('Enviando POST a /api/posts');
      const response = await api.post('/api/posts', postData);
      console.log('Respuesta del servidor (POST):', response.data);
      savedPost = response.data;
    }

    // Si hay una imagen, subirla después de guardar el post
    if (post.value.featuredImage && post.value.featuredImage instanceof File) {
      try {
        console.log('Subiendo imagen destacada...');

        // Crear un FormData simple y directo
        const formData = new FormData();
        formData.append('image', post.value.featuredImage);
        formData.append('entityType', 'post');
        formData.append('entityId', savedPost.uuid);

        // Verificar que la imagen se haya adjuntado correctamente
        console.log('FormData entries:', [...formData.entries()]);
        console.log('Imagen a subir:', {
          name: post.value.featuredImage.name,
          type: post.value.featuredImage.type,
          size: post.value.featuredImage.size,
          lastModified: post.value.featuredImage.lastModified
        });

        // Usar fetch nativo para mayor control sobre la solicitud
        const response = await fetch(`${apiBaseUrl.value}/api/media/upload`, {
          method: 'POST',
          body: formData
        });

        const responseData = await response.json();
        console.log('Respuesta de carga de imagen:', response.status, responseData);

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${JSON.stringify(responseData)}`);
        }

        if (responseData) {
          console.log('Imagen subida exitosamente:', responseData);

          // Actualizar el post con la URL de la imagen usando fetch en lugar de axios
          console.log('Actualizando post con imagen:', {
            uuid: savedPost.uuid,
            image: responseData.original || responseData.path,
            imageId: responseData.id
          });

          try {
            // Crear un objeto con los campos de imagen para la actualización
            // Ahora el modelo Post tiene campo imageId, igual que Page
            const imageUpdateData = {
              image: responseData.original || responseData.path,
              imageId: responseData.id
            };

            console.log('Datos para actualizar post con imagen:', imageUpdateData);

            // Usar fetch nativo en lugar de axios para evitar problemas de formato
            const updateResponse = await fetch(`${apiBaseUrl.value}/api/posts/uuid/${savedPost.uuid}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(imageUpdateData)
            });

            const updateResponseData = await updateResponse.json();

            if (!updateResponse.ok) {
              throw new Error(`Error ${updateResponse.status}: ${JSON.stringify(updateResponseData)}`);
            }

            console.log('Post actualizado con imagen:', updateResponseData);

            // Actualizar el post local con la información de la imagen
            savedPost.image = responseData.original || responseData.path;
            savedPost.imageId = responseData.id;
          } catch (updateError) {
            console.error('Error al actualizar post con imagen:', updateError);
            // Aún así, continuamos con el flujo
          }
        }
      } catch (imageError) {
        console.error('Error al subir la imagen:', imageError);
        // No interrumpir el flujo si falla la subida de la imagen
      }
    } else if (post.value.removeImage) {
      // Si se solicitó eliminar la imagen
      try {
        await api.put(`/api/posts/uuid/${savedPost.uuid}`, {
          removeImage: true
        });
        console.log('Imagen eliminada exitosamente');
      } catch (removeError) {
        console.error('Error al eliminar la imagen:', removeError);
      }
    }

    router.push('/posts');

  } catch (err) {
    console.error('Post error:', err);
    console.error('Post error details:', {
      message: err.message,
      response: err.response?.data,
      stack: err.stack
    });
    error.value = err.response?.data?.message || err.message || 'Error saving post';
  } finally {
    isSaving.value = false;
  }
}

onMounted(async () => {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    router.push('/login');
    return;
  }

  try {
    // Extract user ID from token (assuming it's encoded in the token)
    // This is a temporary solution - you should ideally decode the JWT properly
    const userId = authToken.split('-').pop();
    if (!userId) {
      throw new Error('Invalid token format');
    }
    post.value.author = userId;
  } catch (error) {
    console.error('Auth error:', error);
    router.push('/login');
  }

  // Load categories
  try {
    const response = await api.get('/api/categories')
    categories.value = response.data
    console.log('Categorías cargadas:', categories.value)
  } catch (error) {
    console.error('Error al cargar categorías:', error)
    categories.value = []
  }

  // Load series
  try {
    const response = await api.get('/api/series')
    series.value = response.data
    console.log('Series cargadas:', series.value)
  } catch (error) {
    console.error('Error al cargar series:', error)
    series.value = []
  }

  // If in edit mode, fetch the post
  if (isEditMode.value) {
    await fetchPost(route.params.id)
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
    post.value.featuredImage = file;
    post.value.removeImage = false;
  };
  img.onerror = () => {
    error.value = 'Error al cargar la imagen';
  };
  img.src = URL.createObjectURL(file);
};

const removeImage = () => {
  // Marcar la imagen para eliminación
  post.value.featuredImage = null;
  post.value.removeImage = true;
};

/**
 * Verifica si un slug está disponible (no está siendo usado por otro post)
 * @param {string} slug - El slug a verificar
 */
const checkSlugAvailability = async (slug) => {
  if (!slug || (isEditMode.value && post.value.slug === slug)) return;

  try {
    const response = await api.get(`/api/posts/check-slug?slug=${encodeURIComponent(slug)}`);

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
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-panel mx-auto"></div>
      <p class="mt-4 text-gray-600">Cargando...</p>
    </div>

    <template v-else>
      <!-- Error message -->

      <div v-if="error" class="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
        <p class="text-red-600 font-medium">{{ error }}</p>
      </div>

      <div :class="['bg-panel overflow-hidden sm:border sm:border-panel sm:rounded sm:shadow-md']">
        <div class="p-3 sm:p-6 border-b border-panel flex justify-between items-center">
          <h1 class="text-2xl font-bold text-gray-900">{{ postTitle }}</h1>
        </div>

        <form @submit.prevent="handleSubmit" class="p-3 sm:p-6 space-y-4 sm:space-y-6">
          <!-- Title Input -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input v-model="post.title" required placeholder="Escribe el título del post"
              class="w-full px-4 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all duration-200">
          </div>

          <!-- Category Select -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select v-model="post.categoryId" required
              class="w-full px-4 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all duration-200">
              <option value="" disabled>Selecciona una categoría</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>

          <!-- Series Select -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Serie (opcional)</label>
            <div class="flex gap-2">
              <select v-model="post.seriesId"
                class="flex-grow px-4 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all duration-200">
                <option :value="null">Sin serie</option>
                <option v-for="item in series" :key="item.id" :value="item.id">
                  {{ item.title }}
                </option>
              </select>
              <button v-if="series.length > 0" type="button" @click="router.push('/series/new')"
                class="px-3 py-2 bg-panel rounded border border-gray-300 hover:bg-gray-200 text-gray-700"
                title="Crear nueva serie">
                <Library class="w-4 h-4" />
              </button>
            </div>

            <!-- Sequence Number Input (solo visible si se selecciona una serie) -->
            <div v-if="post.seriesId" class="mt-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Número de secuencia en la serie</label>
              <input v-model="post.sequenceNumber" type="number" min="1"
                placeholder="Posición en la serie (ej: 1, 2, 3...)"
                class="w-full px-4 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all duration-200">
              <p class="mt-1 text-xs text-gray-500">Define el orden de este post dentro de la serie.</p>
            </div>
          </div>

          <!-- Slug Input usando el componente SlugField -->
          <SlugField v-model="post.slug" :source-text="post.title" prefix="/blog/" label="Slug"
            placeholder="mi-post-url" hint="URL amigable para el post. Se genera automáticamente a partir del título."
            @check-availability="checkSlugAvailability" />

          <!-- Espacio reservado para otros campos futuros -->

          <!-- Content Editor -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Contenido</label>
            <TipTapEditor v-model="post.content"
              class="min-h-[200px] border border-gray-300 rounded focus:ring-2 focus:ring-gray-300 overflow-hidden transition-all duration-200" />
          </div>

          <!-- Excerpt Input -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Resumen (máx. 160 caracteres)</label>
            <textarea v-model="post.excerpt" maxlength="160" placeholder="Breve descripción del post"
              class="w-full px-4 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all duration-200"
              rows="3"></textarea>
            <p class="text-xs text-gray-500 mt-1">{{ post.excerpt?.length || 0 }}/160 caracteres</p>
          </div>

          <!-- Featured Image Upload -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Imagen destacada (JPG/PNG/WebP, min.
              800×600px)</label>

            <!-- Mostrar imagen existente si hay una -->
            <div v-if="post.existingImage && !post.removeImage" class="mt-2 mb-3">
              <div class="relative w-64 h-40 overflow-hidden rounded border border-panel">
                <img :src="getFullImageUrl(post.existingImage)" alt="Imagen destacada"
                  class="object-cover w-full h-full">
                <button @click="removeImage" type="button"
                  class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none"
                  title="Eliminar imagen">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Selector de nueva imagen -->
            <div v-if="!post.existingImage || post.removeImage" class="mt-1 flex items-center">
              <input type="file" id="featuredImage" accept="image/jpeg,image/png,image/webp" @change="handleImageUpload"
                class="sr-only">
              <label for="featuredImage"
                class="cursor-pointer rounded-md bg-panel py-2 px-3 text-sm font-medium text-gray-700 shadow-sm border border-gray-300 hover:bg-panel focus:outline-none focus:ring-2 focus:ring-gray-300">
                Seleccionar imagen
              </label>
              <span class="ml-4 text-sm text-gray-500" v-if="post.featuredImage">
                {{ post.featuredImage.name }}
              </span>
            </div>

            <!-- Mensaje si la imagen ha sido marcada para eliminación -->
            <div v-if="post.removeImage && !post.featuredImage" class="mt-2 text-sm text-yellow-600">
              La imagen será eliminada al guardar
              <button @click="post.removeImage = false" type="button" class="ml-2 text-blue-600 hover:underline">
                Cancelar
              </button>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex flex-wrap items-center justify-between pt-6 border-t border-gray-100">
            <!-- Status Toggle -->
            <div class="flex items-center mb-4 sm:mb-0">
              <div class="relative inline-block w-14 mr-2 align-middle select-none">
                <input type="checkbox" :checked="post.status === 'published'"
                  @change="post.status = $event.target.checked ? 'published' : 'draft'"
                  class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-panel border-2 appearance-none cursor-pointer" />
                <label class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300"></label>
              </div>
              <span :class="{
                'text-sm font-medium': true,
                'text-green-600': post.status === 'published',
                'text-yellow-600': post.status === 'draft'
              }">
                {{ post.status === 'published' ? 'Publicado' : 'Borrador' }}
              </span>
            </div>

            <!-- Buttons -->
            <div class="flex gap-3 ml-auto">
              <BaseButton type="button" variant="secondary" @click="router.push('/posts')" :disabled="isSaving">
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
                  {{ isSaving ? 'Guardando...' : 'Guardar Post' }}
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
  background-color: grey;
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
