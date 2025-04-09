<script setup>
import { computed } from 'vue'
import { Tag, Edit, Trash2 } from 'lucide-vue-next'

const props = defineProps({
  categories: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete'])

const sortedCategories = computed(() => {
  return [...props.categories].sort((a, b) => a.name.localeCompare(b.name))
})
</script>

<template>
  <div class="bg-white border border-gray-200 rounded overflow-hidden">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posts</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="category in sortedCategories" :key="category.id" class="hover:bg-gray-50 transition-colors duration-150">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-8 w-8 bg-gray-100 rounded flex items-center justify-center text-gray-600">
                  <Tag class="w-4 h-4" />
                </div>
                <div class="ml-3">
                  <div class="text-sm font-medium text-gray-900">{{ category.name }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">/{{ category.slug }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">{{ category.postCount || 0 }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <div class="flex space-x-2">
                <button 
                  @click="() => emit('edit', category)" 
                  class="p-1 rounded hover:bg-gray-100 text-gray-600 transition-colors"
                  title="Editar"
                >
                  <Edit class="w-4 h-4" />
                </button>
                <button 
                  @click="() => emit('delete', category.id)" 
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
  </div>
</template>