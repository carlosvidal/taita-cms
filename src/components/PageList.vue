<script setup>
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import BaseButton from './BaseButton.vue'

const router = useRouter()
const props = defineProps({
  pages: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['delete', 'create'])

const isEmpty = computed(() => {
  return !props.loading && (!props.pages || props.pages.length === 0)
})

const handleEdit = (id) => {
  router.push(`/pages/${id}/edit`)
}

const handleCreate = () => {
  router.push('/pages/new')
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="page in pages" :key="page.id" class="hover:bg-gray-50 transition-colors duration-150">
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center">
              <div class="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
                <span class="material-icons text-sm">description</span>
              </div>
              <div class="ml-3">
                <div class="text-sm font-medium text-gray-900">{{ page.title }}</div>
              </div>
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ page.slug }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            <div class="flex space-x-2">
              <button 
                @click="() => handleEdit(page.id)" 
                class="p-1 rounded-md hover:bg-gray-100 text-gray-600 transition-colors"
                title="Editar"
              >
                <span class="material-icons text-sm">edit</span>
              </button>
              <button 
                @click="() => emit('delete', page.id)" 
                class="p-1 rounded-md hover:bg-red-50 text-red-600 transition-colors"
                title="Eliminar"
              >
                <span class="material-icons text-sm">delete</span>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>