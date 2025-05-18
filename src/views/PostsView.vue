<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ViewLayout from '@/views/ViewLayout.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseTable from '@/components/BaseTable.vue'
import api from '@/utils/api'
import { Plus, FileText, Edit, Trash2, Eye } from 'lucide-vue-next'

const router = useRouter()
const posts = ref([])
const isLoading = ref(false)
const activeBlog = ref(null)

// Función para ver el post en el frontend
const viewPost = (post) => {
  if (post.status?.toUpperCase() !== 'PUBLISHED') {
    alert('Solo los posts publicados pueden ser visualizados en el frontend')
    return
  }
  
  if (!post.slug) {
    alert('Este post no tiene un slug válido')
    return
  }
  
  const blogSubdomain = activeBlog.value?.subdomain || 'demo'
  const blogDomain = activeBlog.value?.domain || 'taita.blog'
  const url = `https://${blogSubdomain}.${blogDomain}/blog/${post.slug}`
  window.open(url, '_blank')
}

// Obtener el blog activo del localStorage
const getActiveBlog = async () => {
  try {
    const blogUuid = localStorage.getItem('activeBlog')
    if (blogUuid) {
      const response = await api.get(`/api/blogs/uuid/${blogUuid}`)
      activeBlog.value = response.data
    }
  } catch (error) {
    console.error('Error al obtener el blog activo:', error)
  }
}

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

const fetchPosts = async () => {
  isLoading.value = true;
  try {
    console.log('Starting fetchPosts...');
    const activeBlogUuid = localStorage.getItem('activeBlog');
    console.log('Active blog UUID from localStorage:', activeBlogUuid);
    
    if (!activeBlogUuid) {
      console.error('No hay un blog activo seleccionado');
      return;
    }

    console.log('Fetching blog details for UUID:', activeBlogUuid);
    const blogResponse = await api.get(`/api/blogs/uuid/${activeBlogUuid}`, {
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    console.log('Blog response:', blogResponse.data);
    
    const blogId = blogResponse.data?.id;
    console.log('Extracted blog ID:', blogId);
    
    if (!blogId) {
      console.error('No se pudo obtener el ID del blog activo');
      return;
    }

    // Get fresh token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No se encontró el token de autenticación');
      // Redirect to login or refresh token
      router.push('/login');
      return;
    }

    console.log('Using token:', token ? 'Token exists' : 'No token');
    
    const response = await api.get('/api/posts', {
      params: {
        blogId: blogId,
        includeDrafts: true
      },
      headers: {
        'Authorization': `Bearer ${token}`,
        'Cache-Control': 'no-cache'
      }
    });
    
    console.log('Posts API response:', response);
    posts.value = response.data;
    console.log('Posts set in component:', posts.value);
  } catch (error) {
    console.error('Error in fetchPosts:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      router.push('/login');
    }
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  getActiveBlog()
  fetchPosts()
})
</script>

<template>
  <ViewLayout>
    <template #title>Posts</template>
    <template #subtitle>Manage your blog posts</template>
    
    <div class="flex justify-between items-center mb-6">
      <div>
        <p v-if="posts.length" class="text-gray-500 text-sm">
          {{ posts.length }} {{ posts.length === 1 ? 'post' : 'posts' }} found
        </p>
      </div>
      
      <BaseButton 
        variant="primary" 
        @click="router.push('/cms/posts/new')"
      >
        <span class="flex items-center whitespace-nowrap">
          <Plus class="w-4 h-4 mr-2" />
          Add Post
        </span>
      </BaseButton>
    </div>
    
    <div v-if="isLoading" class="py-8 text-center text-gray-500">
      <div class="animate-pulse flex justify-center">
        <div class="h-4 w-24 bg-gray-200 rounded"></div>
      </div>
      <p class="mt-2 text-sm">Loading posts...</p>
    </div>
    
    <div v-else-if="!posts.length" class="py-12 text-center">
      <div class="text-gray-400 mb-3">
        <FileText class="w-10 h-10" />
      </div>
      <h3 class="text-lg font-medium text-gray-700 mb-1">No posts found</h3>
      <p class="text-gray-500 text-sm">Create your first post to get started</p>
    </div>
    
    <BaseTable v-else class="text-sm">
      <template #header>
        <th>Título</th>
        <th>Autor</th>
        <th>Categoría</th>
        <th>Estado</th>
        <th>Última edición</th>
        <th>Acciones</th>
      </template>
      
      <template #body>
        <tr v-for="post in posts" :key="post.id" class="hover:bg-gray-50">
          <td>
            <div class="flex items-center">
              <div class="flex-shrink-0 h-8 w-8 bg-gray-100 rounded flex items-center justify-center text-gray-500">
                <FileText class="w-4 h-4" />
              </div>
              <div class="ml-3">
                <div class="text-sm font-medium text-gray-900">{{ post.title }}</div>
                <div class="text-xs text-gray-500">{{ post.slug }}</div>
              </div>
            </div>
          </td>
          <td>
            <div class="text-sm text-gray-900">{{ post.author?.name || 'Sin autor' }}</div>
            <div class="text-xs text-gray-500">{{ post.author?.email }}</div>
          </td>
          <td>
            <!-- Categoría sin estilo pill -->
            <div class="text-sm text-gray-900">
              {{ post.category?.name || 'Sin categoría' }}
            </div>
          </td>
          <td>
            <!-- Estado con estilo pill y comparación case-insensitive -->
            <span 
              :class="{
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium': true,
                'bg-green-100 text-green-800': post.status?.toUpperCase() === 'PUBLISHED',
                'bg-yellow-100 text-yellow-800': post.status?.toUpperCase() === 'DRAFT'
              }"
            >
              {{ post.status?.toUpperCase() === 'PUBLISHED' ? 'Publicado' : 'Borrador' }}
            </span>
          </td>
          <td>
            <div class="text-sm text-gray-500">
              {{ formatDate(post.updatedAt) }}
            </div>
          </td>
          <td>
            <div class="flex gap-2">
              <button 
                v-if="post.status?.toUpperCase() === 'PUBLISHED'"
                @click="() => viewPost(post)" 
                class="p-1 rounded hover:bg-blue-50 text-blue-600 transition-colors"
                title="Ver en el frontend"
              >
                <Eye class="w-4 h-4" />
              </button>
              <button 
                @click="() => router.push(`/cms/posts/${post.uuid}/edit`)" 
                class="p-1 rounded hover:bg-gray-100 text-gray-600 transition-colors"
                title="Editar"
              >
                <Edit class="w-4 h-4" />
              </button>
              <button 
                @click="() => handleDelete(post.uuid)" 
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