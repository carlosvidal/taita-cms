<template>
  <ViewLayout>
    <template #title>Dashboard</template>
    <template #subtitle>Bienvenido a tu panel de control</template>
    
    <div class="space-y-8">
      <!-- Stats Overview -->
      <section>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-medium text-gray-900">Resumen</h2>
          <button @click="fetchStats" class="p-1 rounded hover:bg-gray-100 text-gray-500 transition-colors" title="Refrescar estadísticas">
            <RefreshCw class="w-4 h-4" />
          </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Posts" :value="stats.posts" icon="article" color="blue" />
          <StatCard title="Páginas" :value="stats.pages" icon="description" color="green">
            <template #footer>Última actualización: {{ new Date().toLocaleDateString() }}</template>
          </StatCard>
          <StatCard title="Categorías" :value="stats.categories" icon="category" color="purple" />
        </div>
      </section>
      
      <!-- Recent Activity -->
      <section class="border border-gray-200 rounded-lg bg-white">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Actividad reciente</h2>
        </div>
        
        <div v-if="isLoading" class="p-8 text-center text-gray-500">
          <div class="animate-pulse flex justify-center">
            <div class="h-4 w-24 bg-gray-200 rounded"></div>
          </div>
          <p class="mt-2 text-sm">Cargando actividad...</p>
        </div>
        
        <div v-else-if="!recentActivity.length" class="p-12 text-center">
          <div class="text-gray-400 mb-3">
            <History class="w-10 h-10" />
          </div>
          <h3 class="text-lg font-medium text-gray-700 mb-1">Sin actividad reciente</h3>
          <p class="text-gray-500 text-sm">Comienza a crear contenido para ver tu actividad aquí</p>
        </div>
        
        <div v-else class="divide-y divide-gray-100">
          <div v-for="(activity, index) in recentActivity" :key="index" class="px-6 py-4 flex items-start hover:bg-gray-50 transition-colors">
            <div class="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 mr-3">
              <component :is="getIconComponent(activity.icon)" class="w-4 h-4" />
            </div>
            <div>
              <p class="text-sm text-gray-900">{{ activity.message }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ activity.time }}</p>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Quick Actions -->
      <section>
        <h2 class="text-lg font-medium text-gray-900 mb-4">Acciones rápidas</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div v-for="action in quickActions" :key="action.name" 
               class="p-4 border border-gray-200 rounded-lg bg-white hover:shadow-sm transition-all cursor-pointer"
               @click="action.action">
            <div class="flex items-center">
              <div :class="`w-8 h-8 rounded flex items-center justify-center mr-3 ${action.bgColor}`">
                <component :is="getIconComponent(action.icon)" class="w-4 h-4 text-white" />
              </div>
              <span class="text-sm font-medium text-gray-700">{{ action.name }}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </ViewLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ViewLayout from '@/views/ViewLayout.vue'
import StatCard from '@/components/StatCard.vue'
import api from '@/utils/api'
import { RefreshCw, FileText, File, Tag, Settings, History, Edit, PlusCircle, Trash2 } from 'lucide-vue-next'

const router = useRouter()
const isLoading = ref(false)

const stats = ref({
  posts: 0,
  pages: 0,
  categories: 0
})

const recentActivity = ref([
  {
    icon: 'edit',
    message: 'Editaste el post "Introducción a Vue 3"',
    time: 'Hace 2 horas'
  },
  {
    icon: 'plus-circle',
    message: 'Creaste una nueva categoría "Tutoriales"',
    time: 'Ayer'
  },
  {
    icon: 'trash',
    message: 'Eliminaste el post "Borrador"',
    time: 'Hace 2 días'
  }
])

const quickActions = [
  {
    name: 'Crear post',
    icon: 'file-text',
    bgColor: 'bg-gray-800',
    action: () => router.push('/posts/new')
  },
  {
    name: 'Crear página',
    icon: 'file',
    bgColor: 'bg-gray-800',
    action: () => router.push('/pages/new')
  },
  {
    name: 'Gestionar categorías',
    icon: 'tag',
    bgColor: 'bg-gray-800',
    action: () => router.push('/categories')
  },
  {
    name: 'Configuración',
    icon: 'settings',
    bgColor: 'bg-gray-800',
    action: () => router.push('/settings')
  }
]

const fetchStats = async () => {
  isLoading.value = true
  try {
    // Verificar si hay un token de autenticación antes de hacer las llamadas a la API
    const token = localStorage.getItem('authToken')
    if (!token) {
      console.warn('No authentication token found')
      return
    }
    
    // Usar Promise.allSettled en lugar de Promise.all para manejar mejor los errores
    const results = await Promise.allSettled([
      api.get('/api/posts/count'),
      api.get('/api/pages/count'),
      api.get('/api/categories/count')
    ])
    
    // Procesar los resultados solo si fueron exitosos
    if (results[0].status === 'fulfilled') {
      stats.value.posts = results[0].value.data.count
    }
    if (results[1].status === 'fulfilled') {
      stats.value.pages = results[1].value.data.count
    }
    if (results[2].status === 'fulfilled') {
      stats.value.categories = results[2].value.data.count
    }
  } catch (error) {
    console.error('Fetch error:', error)
  } finally {
    isLoading.value = false
  }
}

// Función para obtener el componente de icono correspondiente
const getIconComponent = (iconName) => {
  const iconMap = {
    'edit': Edit,
    'plus-circle': PlusCircle,
    'trash': Trash2,
    'file-text': FileText,
    'file': File,
    'tag': Tag,
    'settings': Settings
  }
  return iconMap[iconName] || Edit
}

onMounted(() => {
  fetchStats()
})
</script>