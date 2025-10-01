<script setup>
import { ref, onMounted } from 'vue'
import ViewLayout from '@/views/ViewLayout.vue'
import TagList from '@/components/TagList.vue'
import TagModal from '@/components/TagModal.vue'
import BaseButton from '@/components/BaseButton.vue'
import api from '@/utils/api'
import { Plus, Tag } from 'lucide-vue-next'

const tags = ref([])
const showModal = ref(false)
const currentTag = ref(null)
const isLoading = ref(false)
const error = ref('')

const fetchTags = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    // Obtener el blog activo del localStorage
    const activeBlogUuid = localStorage.getItem('activeBlog');
    if (!activeBlogUuid) {
      console.warn('No hay un blog activo seleccionado');
      tags.value = [];
      return;
    }

    // Buscar el blog para obtener el ID
    const blogResponse = await api.get(`/api/blogs/uuid/${activeBlogUuid}`);
    const blogId = blogResponse.data.id;

    // Obtener tags del blog activo
    const response = await api.get('/api/tags', {
      params: { blogId }
    });
    tags.value = response.data;
  } catch (err) {
    error.value = err.response?.data?.message ||
                 'Failed to connect to server. Please check your connection and try again.';
    console.error('API Error:', {
      url: err.config?.url,
      status: err.response?.status,
      data: err.response?.data
    });
  } finally {
    isLoading.value = false;
  }
};

const handleEdit = (tag) => {
  currentTag.value = { ...tag }
  showModal.value = true
}

const handleCreate = () => {
  currentTag.value = null
  showModal.value = true
}

const handleSave = async (tagData) => {
  try {
    // Obtener el blog activo del localStorage
    const activeBlogUuid = localStorage.getItem('activeBlog');
    if (!activeBlogUuid) {
      throw new Error('No hay un blog seleccionado');
    }

    // Buscar el blog para obtener el ID
    const blogResponse = await api.get(`/api/blogs/uuid/${activeBlogUuid}`);
    const blogId = blogResponse.data.id;

    // Validar que tengamos un blogId válido
    if (!blogId) {
      throw new Error('No se pudo obtener el ID del blog');
    }

    // Preparar los datos con el blogId
    const tagWithBlog = {
      ...tagData,
      blogId: blogId
    };

    console.log('Guardando tag con datos:', tagWithBlog);

    if (tagData.id) {
      // Actualizar tag existente
      const response = await api.patch(`/api/tags/${tagData.id}`, tagWithBlog);
      console.log('Tag actualizado:', response.data);
    } else {
      // Crear nuevo tag
      const response = await api.post('/api/tags', tagWithBlog);
      console.log('Nuevo tag creado:', response.data);
    }

    await fetchTags();
    showModal.value = false;
  } catch (err) {
    error.value = err.response?.data?.error || err.message || 'Error al guardar el tag';
    console.error('Save Error:', err.response?.data || err);
  }
};

const handleDelete = async (id) => {
  if (!confirm('¿Estás seguro de que quieres eliminar este tag?')) return;

  try {
    await api.delete(`/api/tags/${id}`);
    await fetchTags();
  } catch (err) {
    error.value = err.response?.data?.message || 'Error deleting tag';
    console.error('Delete Error:', err.response?.data);
  }
}

onMounted(fetchTags)
</script>

<template>
  <ViewLayout>
    <template #title>Tags</template>
    <template #subtitle>Gestiona los tags de tu blog</template>

    <div class="space-y-6">
      <!-- Error message -->
      <div v-if="error" class="p-4 bg-red-50 rounded-lg border border-red-200">
        <p class="text-red-600 font-medium">{{ error }}</p>
      </div>

      <div class="flex justify-between items-center">
        <h2 class="text-lg font-medium text-gray-900">Lista de tags</h2>
        <BaseButton
          variant="primary"
          size="sm"
          @click="handleCreate"
        >
          <template #icon>
            <Plus class="w-4 h-4" />
          </template>
          Nuevo tag
        </BaseButton>
      </div>

      <!-- Loading state -->
      <div v-if="isLoading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-800 mx-auto"></div>
        <p class="mt-2 text-gray-600 text-sm">Cargando tags...</p>
      </div>

      <!-- Empty state -->
      <div v-else-if="!tags.length" class="text-center py-12 bg-white rounded-lg border border-gray-200">
        <div class="text-gray-400 mb-3">
          <Tag class="w-10 h-10" />
        </div>
        <h3 class="text-lg font-medium text-gray-700 mb-1">No hay tags</h3>
        <p class="text-gray-500 text-sm mb-4">Comienza creando tu primer tag</p>
        <BaseButton variant="primary" size="sm" @click="handleCreate">
          <template #icon>
            <Plus class="w-4 h-4" />
          </template>
          Crear tag
        </BaseButton>
      </div>

      <!-- Tags list -->
      <TagList
        v-else
        :tags="tags"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </div>

    <!-- Tag modal -->
    <TagModal
      v-if="showModal"
      :tag="currentTag"
      @save="handleSave"
      @close="showModal = false"
    />
  </ViewLayout>
</template>
