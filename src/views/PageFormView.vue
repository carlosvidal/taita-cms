<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/utils/api'
import TipTapEditor from '@/components/TipTapEditor.vue'
import BaseButton from '@/components/BaseButton.vue'
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
  featuredImage: null
})

// Remove the HTML template code from here
const isEditMode = computed(() => {
  return !!route.params.id
})

const pageTitle = computed(() => {
  return isEditMode.value ? 'Editar Página' : 'Crear Página'
})

const fetchPage = async (uuid) => {
  isLoading.value = true
  try {
    console.log(`Obteniendo página con UUID: ${uuid}`)
    const response = await api.get(`/api/pages/uuid/${uuid}`)
    page.value = response.data
    console.log('Página obtenida:', response.data)
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
    let authorId;
    if (!authUser?.id) {
      console.log('No hay usuario autenticado, usando ID temporal');
      authorId = 1; // ID temporal para pruebas
    } else {
      authorId = authUser.id;
    }

    // Prepare payload with simplified structure
    const pageData = {
      title: page.value.title.trim(),
      content: page.value.content.trim(),
      excerpt: page.value.excerpt?.trim() || '',
      slug: page.value.slug?.trim() || null,
      status: page.value.status || 'draft',
      authorId: authorId // Usar el ID que determinamos anteriormente
    };
    
    console.log('Payload completo:', pageData);

    if (isEditMode.value) {
      console.log(`Enviando PUT a /api/cms-pages/${route.params.id}`);
      const response = await api.put(`/api/cms-pages/${route.params.id}`, pageData);
      console.log('Respuesta del servidor (PUT):', response.data);
    } else {
      console.log('Enviando POST a /api/cms-pages');
      const response = await api.post('/api/cms-pages', pageData);
      console.log('Respuesta del servidor (POST):', response.data);
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
    await fetchPage(route.params.id)
  }
})

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file type
  if (!file.type.match('image/jpeg')) {
    error.value = 'Solo se permiten imágenes JPG';
    return;
  }

  // Validate image dimensions
  const img = new Image();
  img.onload = function () {
    if (this.width < 800 || this.height < 600) {
      error.value = `La imagen debe ser de al menos 800×600px (actual: ${this.width}×${this.height}px)`;
      return;
    }
    page.value.featuredImage = file;
  };
  img.onerror = () => {
    error.value = 'Error al cargar la imagen';
  };
  img.src = URL.createObjectURL(file);
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

          <!-- Slug Input -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <div
              class="flex rounded border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-gray-300 focus-within:border-gray-300">
              <span class="bg-gray-50 px-3 py-2 text-gray-500 text-sm border-r border-gray-300">/</span>
              <input v-model="page.slug" placeholder="mi-pagina" class="flex-1 px-4 py-2 focus:outline-none">
            </div>
          </div>

          <!-- Status Selector -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select v-model="page.status"
              class="w-full px-4 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all duration-200">
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
            </select>
          </div>

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
            <label class="block text-sm font-medium text-gray-700 mb-1">Imagen destacada (JPG, min. 800×600px)</label>
            <div class="mt-1 flex items-center">
              <input type="file" id="featuredImage" accept="image/jpeg" @change="handleImageUpload" class="sr-only">
              <label for="featuredImage"
                class="cursor-pointer rounded-md bg-white py-2 px-3 text-sm font-medium text-gray-700 shadow-sm border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300">
                Seleccionar imagen
              </label>
              <span class="ml-4 text-sm text-gray-500" v-if="page.featuredImage">
                {{ page.featuredImage.name }}
              </span>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex flex-wrap justify-end gap-3 pt-6 border-t border-gray-100">
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
        </form>
      </div>
    </template>
  </div>
</template>
