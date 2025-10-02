<template>
  <ViewLayout>
    <template #title>{{ $t('menu.title') }}</template>
    <template #subtitle>{{ $t('menu.subtitle') }}</template>

    <div class="flex justify-between items-center mb-6">
      <div>
        <p v-if="menuItems.length" class="text-gray-500 text-sm">
          {{ $t('menu.itemsFound', { count: menuItems.length }) }}
        </p>
      </div>

      <BaseButton variant="primary" @click="showCreateModal = true">
        <template #icon>
          <Plus class="w-4 h-4" />
        </template>
        {{ $t('menu.addItem') }}
      </BaseButton>
    </div>

    <div v-if="isLoading" class="py-8 text-center text-gray-500">
      <div class="animate-pulse flex justify-center">
        <div class="h-4 w-24 bg-gray-200 rounded"></div>
      </div>
      <p class="mt-2 text-sm">{{ $t('menu.loading') }}</p>
    </div>

    <div v-else-if="!menuItems.length" class="py-12 text-center">
      <div class="text-gray-400 mb-3">
        <Menu class="w-10 h-10" />
      </div>
      <h3 class="text-lg font-medium text-gray-700 mb-1">{{ $t('menu.noItemsFound') }}</h3>
      <p class="text-gray-500 text-sm">{{ $t('menu.createFirst') }}</p>
    </div>

    <MenuList v-else :items="menuItems" @reorder="handleReorder" @edit="handleEdit" @delete="handleDelete" />

    <MenuModal v-if="showCreateModal || editingItem" :item="editingItem" @close="closeModal" @save="handleSave" />
  </ViewLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ViewLayout from '@/views/ViewLayout.vue'
import BaseButton from '@/components/BaseButton.vue'
import MenuList from '@/components/MenuList.vue'
import MenuModal from '@/components/MenuModal.vue'
import api from '@/utils/api'
import { Plus, Menu } from 'lucide-vue-next'

const { t } = useI18n()
const menuItems = ref([])
const showCreateModal = ref(false)
const editingItem = ref(null)
const isLoading = ref(false)
const error = ref(null)

const getCurrentBlogId = () => {
  const pathParts = window.location.pathname.split('/');
  const blogIdIndex = pathParts.findIndex(part => part === 'blog') + 1;
  const blogId = pathParts[blogIdIndex];
  
  if (blogId && !isNaN(blogId)) {
    return parseInt(blogId);
  }
  
  const storedBlogId = localStorage.getItem('currentBlogId');
  if (storedBlogId) {
    return parseInt(storedBlogId);
  }
  
  return 1;
};

const fetchMenuItems = async () => {
  isLoading.value = true;
  error.value = null;
  const blogId = getCurrentBlogId();
  
  try {
    const response = await api.get(`/api/menu?blogId=${blogId}`);
    menuItems.value = response.data;
  } catch (err) {
    error.value = err.response?.data?.message || t('menu.loadError');
    console.error('Menu API Error:', {
      url: err.config?.url,
      status: err.response?.status,
      data: err.response?.data
    });
  } finally {
    isLoading.value = false;
  }
};

const handleSave = async (itemData) => {
  try {
    if (!itemData.label?.trim()) {
      throw new Error(t('validation.labelRequired'));
    }
    if (!itemData.url?.trim()) {
      throw new Error(t('validation.urlRequired'));
    }

    const url = itemData.url.trim();
    if (!url.match(/^(https?:\/\/|\/)/)) {
      throw new Error(t('validation.urlFormat'));
    }

    const blogId = getCurrentBlogId();
    
    const payload = {
      label: itemData.label.trim(),
      url: url,
      order: itemData.order || 0,
      blogId: blogId,
      ...(itemData.parentId && { parentId: Number(itemData.parentId) }),
      ...(itemData.icon && { icon: itemData.icon.trim() })
    };

    await api.post('/api/menu', payload);
    await fetchMenuItems();
    showCreateModal.value = false;
  } catch (err) {
    error.value = err.response?.data?.details || 
                err.response?.data?.message || 
                err.message || 
                t('menu.saveError');
    
    console.error('Detailed Save Error:', {
      error: err.response?.data,
      stack: err.stack,
      inputData: itemData,
      timestamp: new Date().toISOString()
    });
  }
};

const handleReorder = async (items) => {
  try {
    const blogId = getCurrentBlogId();
    await api.patch('/api/menu/reorder', { 
      items,
      blogId
    });
    await fetchMenuItems();
  } catch (error) {
    console.error(t('menu.reorderError'), error);
    throw error;
  }
}

const handleEdit = (item) => {
  editingItem.value = { 
    ...item,
    blogId: item.blogId || getCurrentBlogId()
  };
}

const handleDelete = async (id) => {
  if (confirm(t('menu.deleteConfirm'))) {
    try {
      const blogId = getCurrentBlogId();
      await api.delete(`/api/menu/${id}?blogId=${blogId}`);
      await fetchMenuItems();
    } catch (error) {
      console.error('Error deleting menu item:', error);
      error.value = error.response?.data?.message || t('menu.deleteError');
    }
  }
}

const closeModal = () => {
  showCreateModal.value = false
  editingItem.value = null
}

onMounted(() => {
  fetchMenuItems()
})
</script>