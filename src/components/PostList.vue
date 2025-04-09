<script setup>
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import BaseButton from './BaseButton.vue'

const router = useRouter()
const props = defineProps({
  posts: {
    type: Array,
    required: true
  },
  title: {
    type: String,
    default: 'Posts'
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['delete', 'create'])

const isEmpty = computed(() => {
  return !props.loading && (!props.posts || props.posts.length === 0)
})

const handleEdit = (id) => {
  router.push(`/posts/${id}/edit`)
}

const handleCreate = () => {
  emit('create')
}
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
      <h2 class="text-lg font-medium text-gray-900">{{ title }}</h2>
      <BaseButton 
        variant="secondary" 
        size="sm" 
        @click="handleCreate"
      >
        <template #icon>
          <span class="material-icons text-sm">add</span>
        </template>
        Nuevo post
      </BaseButton>
    </div>
    
    <div v-if="loading" class="p-8 text-center text-gray-500">
      <div class="animate-pulse flex justify-center">
        <div class="h-4 w-24 bg-gray-200 rounded"></div>
      </div>
      <p class="mt-2 text-sm">Cargando posts...</p>
    </div>
    
    <div v-else-if="isEmpty" class="p-12 text-center">
      <div class="text-gray-400 mb-3">
        <span class="material-icons text-4xl">article</span>
      </div>
      <h3 class="text-lg font-medium text-gray-700 mb-1">No hay posts</h3>
      <p class="text-gray-500 text-sm mb-4">Comienza creando tu primer post</p>
      <BaseButton variant="primary" size="sm" @click="handleCreate">
        <template #icon>
          <span class="material-icons text-sm">add</span>
        </template>
        Crear post
      </BaseButton>
    </div>
    
    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="post in posts" :key="post.id" class="hover:bg-gray-50 transition-colors duration-150">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
                  <span class="material-icons text-sm">article</span>
                </div>
                <div class="ml-3">
                  <div class="text-sm font-medium text-gray-900">{{ post.title }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700">{{ post.category?.name || 'Sin categoría' }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ post.slug }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <div class="flex space-x-2">
                <button 
                  @click="() => handleEdit(post.id)" 
                  class="p-1 rounded-md hover:bg-gray-100 text-gray-600 transition-colors"
                  title="Editar"
                >
                  <span class="material-icons text-sm">edit</span>
                </button>
                <button 
                  @click="() => emit('delete', post.id)" 
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
  </div>
</template>