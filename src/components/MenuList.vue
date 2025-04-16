<template>
  <div class="bg-panel rounded border border-panel shadow-sm w-full">
    <table class="min-w-full divide-y border-panel">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Label</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody class="bg-panel divide-y border-panel">
        <tr 
          v-for="item in items" 
          :key="item.id"
          :class="{
            'hover:bg-gray-50 transition-colors duration-150': true,
            'bg-blue-50': isDraggingOver === item.id,
            'opacity-50': draggedItem && draggedItem.id === item.id
          }"
          draggable="true"
          @dragstart="(e) => dragStart(item, e)"
          @dragover.prevent="(e) => dragOver(item, e)"
          @drop="(e) => drop(item, e)"
          @dragenter.prevent="(e) => dragEnter(item, e)"
          @dragleave="(e) => dragLeave(item, e)"
          @dragend="(e) => dragEnd(e)"
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
const isDraggingOver = ref(null)

const dragStart = (item, event) => {
  draggedItem.value = item
  // Añadir un efecto visual para el cursor
  event.dataTransfer.effectAllowed = 'move'
  // Establecer datos para el arrastre
  event.dataTransfer.setData('text/plain', item.id)
  
  // Intentar establecer una imagen personalizada para el arrastre (opcional)
  try {
    const dragImage = document.createElement('div')
    dragImage.textContent = item.label
    dragImage.style.cssText = 'position: absolute; top: -1000px; opacity: 0;'
    document.body.appendChild(dragImage)
    event.dataTransfer.setDragImage(dragImage, 0, 0)
    setTimeout(() => document.body.removeChild(dragImage), 0)
  } catch (e) {
    console.log('Error al establecer la imagen de arrastre:', e)
  }
}

const dragOver = (item, event) => {
  // Solo marcamos el elemento sobre el que estamos arrastrando
  // No hacemos ningún cambio real hasta que se complete el drop
  if (draggedItem.value && draggedItem.value.id !== item.id) {
    event.dataTransfer.dropEffect = 'move'
  }
}

const dragEnter = (item, event) => {
  if (draggedItem.value && draggedItem.value.id !== item.id) {
    isDraggingOver.value = item.id
  }
}

const dragLeave = (item, event) => {
  if (isDraggingOver.value === item.id) {
    isDraggingOver.value = null
  }
}

const dragEnd = (event) => {
  // Limpiar el estado cuando se termina el arrastre (ya sea que se suelte o se cancele)
  draggedItem.value = null
  isDraggingOver.value = null
}

const drop = (item, event) => {
  event.preventDefault()
  if (!draggedItem.value) return
  
  if (draggedItem.value.id !== item.id) {
    const draggedIndex = props.items.findIndex(i => i.id === draggedItem.value.id)
    const targetIndex = props.items.findIndex(i => i.id === item.id)
    
    const newItems = [...props.items]
    newItems.splice(draggedIndex, 1)
    newItems.splice(targetIndex, 0, draggedItem.value)
    
    // Emitir el evento de reordenamiento con los nuevos índices
    emit('reorder', newItems.map((item, index) => ({
      id: item.id,
      order: index + 1
    })))
  }
  
  // Limpiar el elemento arrastrado
  draggedItem.value = null
  // Limpiar el elemento sobre el que estamos arrastrando
  isDraggingOver.value = null
}
</script>