<template>
  <ViewLayout>
    <template #title>Menu Manager</template>
    <template #subtitle>Manage your website menu items</template>

    <div class="flex justify-between items-center mb-6">
      <div>
        <p v-if="menuItems.length" class="text-gray-500 text-sm">
          {{ menuItems.length }} {{ menuItems.length === 1 ? 'item' : 'items' }} found
        </p>
      </div>

      <BaseButton variant="primary" @click="showCreateModal = true">
        <template #icon>
          <Plus class="w-4 h-4" />
        </template>
        Add Menu Item
      </BaseButton>
    </div>

    <div v-if="isLoading" class="py-8 text-center text-gray-500">
      <div class="animate-pulse flex justify-center">
        <div class="h-4 w-24 bg-gray-200 rounded"></div>
      </div>
      <p class="mt-2 text-sm">Loading menu items...</p>
    </div>

    <div v-else-if="!menuItems.length" class="py-12 text-center">
      <div class="text-gray-400 mb-3">
        <Menu class="w-10 h-10" />
      </div>
      <h3 class="text-lg font-medium text-gray-700 mb-1">No menu items found</h3>
      <p class="text-gray-500 text-sm">Create your first menu item to get started</p>
    </div>

    <MenuList v-else :items="menuItems" @reorder="handleReorder" @edit="handleEdit" @delete="handleDelete" />

    <MenuModal v-if="showCreateModal || editingItem" :item="editingItem" @close="closeModal" @save="handleSave" />
  </ViewLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ViewLayout from '@/views/ViewLayout.vue'
import BaseButton from '@/components/BaseButton.vue'
import MenuList from '@/components/MenuList.vue'
import MenuModal from '@/components/MenuModal.vue'
import api from '@/utils/api'
import { Plus, Menu } from 'lucide-vue-next'

const menuItems = ref([])
const showCreateModal = ref(false)
const editingItem = ref(null)
const isLoading = ref(false)
const error = ref(null)

const fetchMenuItems = async () => {
  isLoading.value = true
  error.value = null
  try {
    const response = await api.get('/api/menu')
    menuItems.value = response.data
  } catch (err) {
    error.value = err.response?.data?.message || 
                 'Failed to load menu. Server may be unavailable.'
    console.error('Menu API Error:', {
      url: err.config?.url,
      status: err.response?.status,
      data: err.response?.data
    })
  } finally {
    isLoading.value = false
  }
}

const handleSave = async (itemData) => {
  try {
    // Enhanced validation with specific error messages
    if (!itemData.label?.trim()) {
      throw new Error('Menu item label is required');
    }
    if (!itemData.url?.trim()) {
      throw new Error('Menu item URL is required');
    }

    // Improved URL validation
    const url = itemData.url.trim();
    if (!url.match(/^(https?:\/\/|\/)/)) {
      throw new Error('URL must start with http://, https:// or /');
    }

    // Structured payload with all required fields
    const payload = {
      label: itemData.label.trim(),
      url: url,
      order: itemData.order || 0,
      ...(itemData.parentId && { parentId: Number(itemData.parentId) }),
      ...(itemData.icon && { icon: itemData.icon.trim() })
    };

    const response = await api.post('/api/menu', payload);
    await fetchMenuItems();
    showCreateModal.value = false;
  } catch (err) {
    error.value = err.response?.data?.details || 
                err.response?.data?.message || 
                err.message || 
                'Failed to save menu item. Please check the data and try again.';
    
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
    await api.patch('/api/menu/reorder', { items })
    await fetchMenuItems()
  } catch (error) {
    console.error('Error reordering menu:', error)
  }
}

const handleEdit = (item) => {
  editingItem.value = { ...item }
}

const handleDelete = async (id) => {
  try {
    await api.delete(`/api/menu/${id}`) // Will call http://localhost:3000/api/menu/:id
    await fetchMenuItems()
  } catch (error) {
    console.error('Error deleting menu item:', error)
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
