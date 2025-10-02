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
              <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                v-model="form.type"
                class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-300"
                required
              >
                <option value="url">URL</option>
                <option value="category">Categoría</option>
                <option value="series">Serie</option>
                <option value="tag">Tag</option>
                <option value="page">Página</option>
              </select>
            </div>

            <div v-if="form.type === 'url'">
              <label class="block text-sm font-medium text-gray-700 mb-1">URL</label>
              <input
                v-model="form.url"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-300"
                :required="form.type === 'url'"
              >
            </div>

            <div v-if="form.type === 'category'">
              <label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select
                v-model="form.referenceId"
                class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-300"
                :required="form.type === 'category'"
              >
                <option value="">Selecciona una categoría</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
            </div>

            <div v-if="form.type === 'series'">
              <label class="block text-sm font-medium text-gray-700 mb-1">Serie</label>
              <select
                v-model="form.referenceId"
                class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-300"
                :required="form.type === 'series'"
              >
                <option value="">Selecciona una serie</option>
                <option v-for="series in seriesList" :key="series.id" :value="series.id">
                  {{ series.name }}
                </option>
              </select>
            </div>

            <div v-if="form.type === 'tag'">
              <label class="block text-sm font-medium text-gray-700 mb-1">Tag</label>
              <select
                v-model="form.referenceId"
                class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-300"
                :required="form.type === 'tag'"
              >
                <option value="">Selecciona un tag</option>
                <option v-for="tag in tags" :key="tag.id" :value="tag.id">
                  {{ tag.name }}
                </option>
              </select>
            </div>

            <div v-if="form.type === 'page'">
              <label class="block text-sm font-medium text-gray-700 mb-1">Página</label>
              <select
                v-model="form.referenceId"
                class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-300"
                :required="form.type === 'page'"
              >
                <option value="">Selecciona una página</option>
                <option v-for="page in pages" :key="page.id" :value="page.id">
                  {{ page.title }}
                </option>
              </select>
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
import { ref, watch, onMounted } from 'vue'
import api from '@/utils/api'

const props = defineProps({
  item: Object
})

const emit = defineEmits(['close', 'save'])

const form = ref({
  label: '',
  type: 'url',
  url: '',
  referenceId: '',
  order: 1,
  parentId: null
})

const categories = ref([])
const seriesList = ref([])
const tags = ref([])
const pages = ref([])

// Cargar datos para los selects
const loadCategories = async () => {
  try {
    const activeBlogUuid = localStorage.getItem('activeBlog')
    if (!activeBlogUuid) return

    const blogResponse = await api.get(`/api/blogs/uuid/${activeBlogUuid}`)
    const blogId = blogResponse.data.id

    const response = await api.get('/api/categories', { params: { blogId } })
    categories.value = response.data
  } catch (error) {
    console.error('Error al cargar categorías:', error)
  }
}

const loadSeries = async () => {
  try {
    const activeBlogUuid = localStorage.getItem('activeBlog')
    if (!activeBlogUuid) return

    const blogResponse = await api.get(`/api/blogs/uuid/${activeBlogUuid}`)
    const blogId = blogResponse.data.id

    const response = await api.get('/api/series', { params: { blogId } })
    seriesList.value = response.data
  } catch (error) {
    console.error('Error al cargar series:', error)
  }
}

const loadTags = async () => {
  try {
    const activeBlogUuid = localStorage.getItem('activeBlog')
    if (!activeBlogUuid) return

    const blogResponse = await api.get(`/api/blogs/uuid/${activeBlogUuid}`)
    const blogId = blogResponse.data.id

    const response = await api.get('/api/tags', { params: { blogId } })
    tags.value = response.data
  } catch (error) {
    console.error('Error al cargar tags:', error)
  }
}

const loadPages = async () => {
  try {
    const activeBlogUuid = localStorage.getItem('activeBlog')
    if (!activeBlogUuid) return

    const blogResponse = await api.get(`/api/blogs/uuid/${activeBlogUuid}`)
    const blogId = blogResponse.data.id

    const response = await api.get('/api/pages', { params: { blogId } })
    pages.value = response.data
  } catch (error) {
    console.error('Error al cargar páginas:', error)
  }
}

watch(() => props.item, (newItem) => {
  if (newItem) {
    form.value = {
      ...newItem,
      type: newItem.type || 'url'
    }
  } else {
    form.value = {
      label: '',
      type: 'url',
      url: '',
      referenceId: '',
      order: props.items?.length + 1 || 1,
      parentId: null
    }
  }
}, { immediate: true })

const handleSubmit = async () => {
  // Generar la URL automáticamente según el tipo
  if (form.value.type !== 'url') {
    const item = form.value
    let slug = ''

    if (item.type === 'category') {
      const category = categories.value.find(c => c.id === parseInt(item.referenceId))
      slug = category?.slug
      item.url = slug ? `/category/${slug}` : ''
    } else if (item.type === 'series') {
      const series = seriesList.value.find(s => s.id === parseInt(item.referenceId))
      slug = series?.slug
      item.url = slug ? `/series/${slug}` : ''
    } else if (item.type === 'tag') {
      const tag = tags.value.find(t => t.id === parseInt(item.referenceId))
      slug = tag?.slug
      item.url = slug ? `/tag/${slug}` : ''
    } else if (item.type === 'page') {
      const page = pages.value.find(p => p.id === parseInt(item.referenceId))
      slug = page?.slug
      item.url = slug ? `/${slug}` : ''
    }
  }

  emit('save', form.value)
}

onMounted(() => {
  loadCategories()
  loadSeries()
  loadTags()
  loadPages()
})
</script>