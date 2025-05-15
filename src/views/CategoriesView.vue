<script setup>
import { ref, onMounted } from 'vue'
import ViewLayout from '@/views/ViewLayout.vue'
import CategoryList from '@/components/CategoryList.vue'
import CategoryModal from '@/components/CategoryModal.vue'
import BaseButton from '@/components/BaseButton.vue'
import api from '@/utils/api'
import { Plus, Tag } from 'lucide-vue-next'

const categories = ref([])
const showModal = ref(false)
const currentCategory = ref(null)
const isLoading = ref(false)
const error = ref('')

const fetchCategories = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await api.get('/api/categories'); // Added /api prefix
    categories.value = response.data;
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

const handleEdit = (category) => {
  currentCategory.value = { ...category }
  showModal.value = true
}

const handleCreate = () => {
  currentCategory.value = null
  showModal.value = true
}

const handleSave = async (categoryData) => {
  try {
    if (categoryData.id) {
      await api.patch(`/api/categories/${categoryData.id}`, categoryData); // Cambiado de PUT a PATCH
    } else {
      await api.post('/api/categories', categoryData);
    }
    await fetchCategories();
    showModal.value = false;
  } catch (err) {
    error.value = err.response?.data?.message || 'Error saving category';
    console.error('Save Error:', err.response?.data);
  }
};

const handleDelete = async (id) => {
  if (!confirm('¿Estás seguro de que quieres eliminar esta categoría?')) return;
  
  try {
    await api.delete(`/api/categories/${id}`);
    await fetchCategories();
  } catch (err) {
    error.value = err.response?.data?.message || 'Error deleting category';
    console.error('Delete Error:', err.response?.data);
  }
}

onMounted(fetchCategories)
</script>

<template>
  <ViewLayout>
    <template #title>Categorías</template>
    <template #subtitle>Gestiona las categorías de tu blog</template>
    
    <div class="space-y-6">
      <!-- Error message -->
      <div v-if="error" class="p-4 bg-red-50 rounded-lg border border-red-200">
        <p class="text-red-600 font-medium">{{ error }}</p>
      </div>
      
      <div class="flex justify-between items-center">
        <h2 class="text-lg font-medium text-gray-900">Lista de categorías</h2>
        <BaseButton 
          variant="primary" 
          size="sm" 
          @click="handleCreate"
        >
          <template #icon>
            <Plus class="w-4 h-4" />
          </template>
          Nueva categoría
        </BaseButton>
      </div>
      
      <!-- Loading state -->
      <div v-if="isLoading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-800 mx-auto"></div>
        <p class="mt-2 text-gray-600 text-sm">Cargando categorías...</p>
      </div>
      
      <!-- Empty state -->
      <div v-else-if="!categories.length" class="text-center py-12 bg-white rounded-lg border border-gray-200">
        <div class="text-gray-400 mb-3">
          <Tag class="w-10 h-10" />
        </div>
        <h3 class="text-lg font-medium text-gray-700 mb-1">No hay categorías</h3>
        <p class="text-gray-500 text-sm mb-4">Comienza creando tu primera categoría</p>
        <BaseButton variant="primary" size="sm" @click="handleCreate">
          <template #icon>
            <Plus class="w-4 h-4" />
          </template>
          Crear categoría
        </BaseButton>
      </div>
      
      <!-- Categories list -->
      <CategoryList 
        v-else
        :categories="categories"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </div>
    
    <!-- Category modal -->
    <CategoryModal
      v-if="showModal"
      :category="currentCategory"
      @save="handleSave"
      @close="showModal = false"
    />
  </ViewLayout>
</template>