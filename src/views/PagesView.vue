<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ViewLayout from '@/views/ViewLayout.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseTable from '@/components/BaseTable.vue'
import api from '@/utils/api'
import { Plus, FileText, Edit, Trash2 } from 'lucide-vue-next'

const router = useRouter()
const pages = ref([])
const isLoading = ref(false)

// Función para formatear fechas
const formatDate = (dateString) => {
  if (!dateString) return 'Fecha no disponible'
  
  const date = new Date(dateString)
  
  // Verificar si la fecha es válida
  if (isNaN(date.getTime())) return 'Fecha inválida'
  
  // Formatear la fecha en formato local
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const fetchPages = async () => {
  isLoading.value = true
  try {
    const response = await api.get('/api/pages')
    pages.value = response.data
    console.log('Páginas cargadas:', pages.value)
  } catch (error) {
    console.error('Error fetching pages:', error)
  } finally {
    isLoading.value = false
  }
}

const handleDelete = async (uuid) => {
  if (!confirm('¿Estás seguro de que deseas eliminar esta página?')) return
  
  try {
    await api.delete(`/api/pages/uuid/${uuid}`)
    await fetchPages()
  } catch (error) {
    console.error('Error deleting page:', error)
  }
}

onMounted(fetchPages)
</script>

<template>
  <ViewLayout>
    <template #title>Pages</template>
    <template #subtitle>Manage your website pages</template>
    
    <div class="flex justify-between items-center mb-6">
      <div>
        <p v-if="pages.length" class="text-gray-500 text-sm">
          {{ pages.length }} {{ pages.length === 1 ? 'page' : 'pages' }} found
        </p>
      </div>
      
      <BaseButton 
        variant="primary" 
        @click="router.push('/cms/pages/new')"
      >
        <template #icon>
          <Plus class="w-4 h-4" />
        </template>
        Add Page
      </BaseButton>
    </div>
    
    <div v-if="isLoading" class="py-8 text-center text-gray-500">
      <div class="animate-pulse flex justify-center">
        <div class="h-4 w-24 bg-gray-200 rounded"></div>
      </div>
      <p class="mt-2 text-sm">Loading pages...</p>
    </div>
    
    <div v-else-if="!pages.length" class="py-12 text-center">
      <div class="text-gray-400 mb-3">
        <FileText class="w-10 h-10" />
      </div>
      <h3 class="text-lg font-medium text-gray-700 mb-1">No pages found</h3>
      <p class="text-gray-500 text-sm">Create your first page to get started</p>
    </div>
    
    <BaseTable v-else class="text-sm">
      <template #header>
        <th>Título</th>
        <th>Autor</th>
        <th>Estado</th>
        <th>Última edición</th>
        <th>Acciones</th>
      </template>
      
      <template #body>
        <tr v-for="page in pages" :key="page.id" class="hover:bg-gray-50">
          <td>
            <div class="flex items-center">
              <div class="flex-shrink-0 h-8 w-8 bg-gray-100 rounded flex items-center justify-center text-gray-500">
                <FileText class="w-4 h-4" />
              </div>
              <div class="ml-3">
                <div class="text-sm font-medium text-gray-900">{{ page.title }}</div>
                <div class="text-xs text-gray-500">{{ page.slug }}</div>
              </div>
            </div>
          </td>
          <td>
            <div class="text-sm text-gray-900">{{ page.author?.name || 'Sin autor' }}</div>
            <div class="text-xs text-gray-500">{{ page.author?.email }}</div>
          </td>
          <td>
            <span 
              :class="{
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium': true,
                'bg-green-100 text-green-800': page.status === 'PUBLISHED',
                'bg-yellow-100 text-yellow-800': page.status === 'DRAFT'
              }"
            >
              {{ page.status === 'PUBLISHED' ? 'Publicado' : 'Borrador' }}
            </span>
          </td>
          <td>
            <div class="text-sm text-gray-500">
              {{ formatDate(page.updatedAt) }}
            </div>
          </td>
          <td>
            <div class="flex gap-2">
              <button 
                @click="() => router.push(`/pages/${page.uuid}/edit`)" 
                class="p-1 rounded hover:bg-gray-100 text-gray-600 transition-colors"
                title="Editar"
              >
                <Edit class="w-4 h-4" />
              </button>
              <button 
                @click="() => handleDelete(page.uuid)" 
                class="p-1 rounded hover:bg-red-50 text-red-600 transition-colors"
                title="Eliminar"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </td>
        </tr>
      </template>
    </BaseTable>
  </ViewLayout>
</template>