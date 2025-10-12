<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ViewLayout from '@/views/ViewLayout.vue'
import CategoryList from '@/components/CategoryList.vue'
import CategoryModal from '@/components/CategoryModal.vue'
import BaseButton from '@/components/BaseButton.vue'
import api from '@/utils/api'
import { useBlog } from '@/composables/useBlog'
import { Plus, Tag } from 'lucide-vue-next'

const { t } = useI18n()
const { getCurrentBlogId } = useBlog()
const categories = ref([])
const showModal = ref(false)
const currentCategory = ref(null)
const isLoading = ref(false)
const error = ref('')

const fetchCategories = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const blogId = await getCurrentBlogId();
    console.log('[CategoriesView] Fetching categories for blogId:', blogId);

    const response = await api.get('/api/categories', {
      params: { blogId }
    });

    categories.value = response.data;
    console.log('[CategoriesView] Loaded', categories.value.length, 'categories for blog ID:', blogId);
  } catch (err) {
    error.value = err.response?.data?.message || t('errors.serverConnection');
    console.error('[CategoriesView] API Error:', {
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
    const blogId = await getCurrentBlogId();
    console.log('[CategoriesView] Saving category for blogId:', blogId);

    const categoryWithBlog = {
      ...categoryData,
      blogId: blogId
    };

    if (categoryData.id) {
      await api.patch(`/api/categories/${categoryData.id}`, categoryWithBlog);
    } else {
      await api.post('/api/categories', categoryWithBlog);
    }

    await fetchCategories();
    showModal.value = false;
  } catch (err) {
    error.value = err.response?.data?.error || err.message || t('categories.saveError');
    console.error('[CategoriesView] Save Error:', err.response?.data || err);
  }
};

const handleDelete = async (id) => {
  if (!confirm(t('categories.deleteConfirm'))) return;
  
  try {
    await api.delete(`/api/categories/${id}`);
    await fetchCategories();
  } catch (err) {
    error.value = err.response?.data?.message || t('categories.deleteError');
    console.error('Delete Error:', err.response?.data);
  }
}

onMounted(fetchCategories)
</script>

<template>
  <ViewLayout>
    <template #title>{{ $t('categories.title') }}</template>
    <template #subtitle>{{ $t('categories.subtitle') }}</template>
    
    <div class="space-y-6">
      <div v-if="error" class="p-4 bg-red-50 rounded-lg border border-red-200">
        <p class="text-red-600 font-medium">{{ error }}</p>
      </div>
      
      <div class="flex justify-between items-center">
        <h2 class="text-lg font-medium text-gray-900">{{ $t('categories.listTitle') }}</h2>
        <BaseButton 
          variant="primary" 
          size="sm" 
          @click="handleCreate"
        >
          <template #icon>
            <Plus class="w-4 h-4" />
          </template>
          {{ $t('categories.newCategory') }}
        </BaseButton>
      </div>
      
      <div v-if="isLoading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-800 mx-auto"></div>
        <p class="mt-2 text-gray-600 text-sm">{{ $t('categories.loading') }}</p>
      </div>
      
      <div v-else-if="!categories.length" class="text-center py-12 bg-white rounded-lg border border-gray-200">
        <div class="text-gray-400 mb-3">
          <Tag class="w-10 h-10" />
        </div>
        <h3 class="text-lg font-medium text-gray-700 mb-1">{{ $t('categories.noCategoriesFound') }}</h3>
        <p class="text-gray-500 text-sm mb-4">{{ $t('categories.createFirst') }}</p>
        <BaseButton variant="primary" size="sm" @click="handleCreate">
          <template #icon>
            <Plus class="w-4 h-4" />
          </template>
          {{ $t('categories.create') }}
        </BaseButton>
      </div>
      
      <CategoryList 
        v-else
        :categories="categories"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </div>
    
    <CategoryModal
      v-if="showModal"
      :category="currentCategory"
      @save="handleSave"
      @close="showModal = false"
    />
  </ViewLayout>
</template>
