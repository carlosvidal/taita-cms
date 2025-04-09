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
      
      <BaseButton 
        variant="primary" 
        @click="showCreateModal = true"
      >
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
    
    <MenuList 
      v-else
      :items="menuItems" 
      @reorder="handleReorder"
      @edit="handleEdit"
      @delete="handleDelete"
    />

    <MenuModal
      v-if="showCreateModal || editingItem"
      :item="editingItem"
      @close="closeModal"
      @save="handleSave"
    />
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

onMounted(async () => {
  await fetchMenuItems()
})

// Replace all axios calls with api calls, for example:
const fetchMenuItems = async () => {
  isLoading.value = true
  try {
    const response = await api.get('/api/menu') // Will call http://localhost:3000/api/menu
    menuItems.value = response.data
  } catch (error) {
    console.error('Error fetching menu items:', error)
  } finally {
    isLoading.value = false
  }
}

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

// Example API call
const handleSave = async (itemData) => {
  try {
    const response = await api.post('/api/menu', itemData) // Will call http://localhost:3000/api/menu
    // Handle response
  } catch (error) {
    console.error('Error saving menu item:', error)
  }
}

const closeModal = () => {
  showCreateModal.value = false
  editingItem.value = null
}
</script>