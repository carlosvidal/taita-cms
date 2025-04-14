<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ViewLayout from '@/views/ViewLayout.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseTable from '@/components/BaseTable.vue'
import api from '@/utils/api'
import { Plus, Library, Edit, Trash2 } from 'lucide-vue-next'

const router = useRouter()
const series = ref([])
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

const fetchSeries = async () => {
  isLoading.value = true
  try {
    const response = await api.get('/api/series')
    series.value = response.data
    console.log('Series cargadas:', series.value)
  } catch (error) {
    console.error('Error fetching series:', error)
  } finally {
    isLoading.value = false
  }
}

const handleDelete = async (uuid) => {
  if (!confirm('¿Estás seguro de que deseas eliminar esta serie? Los posts asociados se desasociarán de la serie.')) return
  
  try {
    await api.delete(`/api/series/uuid/${uuid}`)
    await fetchSeries()
  } catch (error) {
    console.error('Error deleting series:', error)
  }
}

onMounted(() => {
  fetchSeries()
})
</script>

<template>
  <ViewLayout>
    <template #title>Series</template>
    <template #subtitle>Gestiona tus series de contenido</template>
    
    <div class="flex justify-between items-center mb-6">
      <div>
        <p v-if="series.length" class="text-gray-500 text-sm">
          {{ series.length }} {{ series.length === 1 ? 'serie' : 'series' }} encontradas
        </p>
      </div>
      
      <BaseButton 
        variant="primary" 
        @click="router.push('/series/new')"
      >
        <span class="flex items-center whitespace-nowrap">
          <Plus class="w-4 h-4 mr-2" />
          Añadir Serie
        </span>
      </BaseButton>
    </div>
    
    <div v-if="isLoading" class="py-8 text-center text-gray-500">
      <div class="animate-pulse flex justify-center">
        <div class="h-4 w-24 bg-gray-200 rounded"></div>
      </div>
      <p class="mt-2 text-sm">Cargando series...</p>
    </div>
    
    <div v-else-if="!series.length" class="py-12 text-center">
      <div class="text-gray-400 mb-3">
        <Library class="w-10 h-10 mx-auto" />
      </div>
      <h3 class="text-lg font-medium text-gray-700 mb-1">No se encontraron series</h3>
      <p class="text-gray-500 text-sm">Crea tu primera serie para comenzar</p>
    </div>
    
    <BaseTable v-else class="text-sm">
      <template #header>
        <th>Título</th>
        <th>Autor</th>
        <th>Posts</th>
        <th>Última edición</th>
        <th>Acciones</th>
      </template>
      
      <template #body>
        <tr v-for="item in series" :key="item.id" class="hover:bg-gray-50">
          <td>
            <div class="flex items-center">
              <div class="flex-shrink-0 h-8 w-8 bg-gray-100 rounded flex items-center justify-center text-gray-500">
                <Library class="w-4 h-4" />
              </div>
              <div class="ml-3">
                <div class="text-sm font-medium text-gray-900">{{ item.title }}</div>
                <div class="text-xs text-gray-500">{{ item.slug }}</div>
              </div>
            </div>
          </td>
          <td>
            <div class="text-sm text-gray-900">{{ item.author?.name || 'Sin autor' }}</div>
            <div class="text-xs text-gray-500">{{ item.author?.email }}</div>
          </td>
          <td>
            <div class="text-sm text-gray-900">
              {{ item.posts?.length || 0 }} posts
            </div>
          </td>
          <td>
            <div class="text-sm text-gray-500">
              {{ formatDate(item.updatedAt) }}
            </div>
          </td>
          <td>
            <div class="flex gap-2">
              <button
                @click="router.push(`/series/${item.uuid}`)"
                class="text-gray-500 hover:text-gray-700"
                title="Editar serie"
              >
                <Edit class="w-4 h-4" />
              </button>
              <button
                @click="handleDelete(item.uuid)"
                class="text-gray-500 hover:text-red-600"
                title="Eliminar serie"
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
