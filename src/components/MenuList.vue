<template>
  <div class="bg-white rounded border border-gray-200 shadow-sm w-full">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Label</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr 
          v-for="item in items" 
          :key="item.id"
          class="hover:bg-gray-50 transition-colors duration-150"
          draggable
          @dragstart="dragStart(item)"
          @dragover.prevent="dragOver(item)"
          @drop="drop(item)"
        >
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center">
              <GripVertical class="w-4 h-4 text-gray-400 mr-2 cursor-move" />
              <div class="text-sm font-medium text-gray-900">{{ item.label }}</div>
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {{ item.url }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            <div class="flex space-x-2">
              <button 
                @click.stop="$emit('edit', item)" 
                class="p-1 rounded hover:bg-gray-100 text-gray-600 transition-colors"
                title="Editar"
              >
                <Edit class="w-4 h-4" />
              </button>
              <button 
                @click.stop="$emit('delete', item.id)" 
                class="p-1 rounded hover:bg-red-50 text-red-600 transition-colors"
                title="Eliminar"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Edit, Trash2, GripVertical } from 'lucide-vue-next'

const props = defineProps({
  items: Array
})

const emit = defineEmits(['reorder', 'edit', 'delete'])

const draggedItem = ref(null)

const dragStart = (item) => {
  draggedItem.value = item
}

const dragOver = (item) => {
  if (draggedItem.value.id !== item.id) {
    const draggedIndex = props.items.findIndex(i => i.id === draggedItem.value.id)
    const targetIndex = props.items.findIndex(i => i.id === item.id)
    
    const newItems = [...props.items]
    newItems.splice(draggedIndex, 1)
    newItems.splice(targetIndex, 0, draggedItem.value)
    
    emit('reorder', newItems.map((item, index) => ({
      id: item.id,
      order: index + 1
    })))
  }
}

const drop = () => {
  draggedItem.value = null
}
</script>