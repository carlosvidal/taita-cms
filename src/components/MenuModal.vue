<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded shadow-xl w-full max-w-md">
      <div class="p-6">
        <h2 class="text-xl font-semibold mb-4">
          {{ item ? 'Edit Menu Item' : 'Add New Menu Item' }}
        </h2>
        
        <form @submit.prevent="handleSubmit">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Label</label>
              <input
                v-model="form.label"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-300"
                required
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">URL</label>
              <input
                v-model="form.url"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-300"
                required
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Order</label>
              <input
                v-model="form.order"
                type="number"
                min="1"
                class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-300"
                required
              >
            </div>
          </div>
          
          <div class="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition-colors duration-200"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  item: Object
})

const emit = defineEmits(['close', 'save'])

const form = ref({
  label: '',
  url: '',
  order: 1,
  parentId: null
})

watch(() => props.item, (newItem) => {
  if (newItem) {
    form.value = { ...newItem }
  } else {
    form.value = {
      label: '',
      url: '',
      order: props.items?.length + 1 || 1,
      parentId: null
    }
  }
}, { immediate: true })

const handleSubmit = () => {
  emit('save', form.value)
}
</script>