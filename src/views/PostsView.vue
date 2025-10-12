<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import ViewLayout from '@/views/ViewLayout.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseTable from '@/components/BaseTable.vue'
import api from '@/utils/api'
import { useBlog } from '@/composables/useBlog'
import { Plus, FileText, Edit, Trash2, Eye } from 'lucide-vue-next'

const { t, locale } = useI18n()
const router = useRouter()
const { getCurrentBlogId, getActiveBlog } = useBlog()
const posts = ref([])
const isLoading = ref(false)
const activeBlog = ref(null)

// Función para ver el post en el frontend
const viewPost = (post) => {
  if (post.status?.toUpperCase() !== 'PUBLISHED') {
    alert(t('posts.viewPostOnlyPublishedWarning'))
    return
  }
  
  if (!post.slug) {
    alert(t('posts.viewPostInvalidSlugWarning'))
    return
  }
  
  const blogSubdomain = activeBlog.value?.subdomain || 'demo'
  const blogDomain = activeBlog.value?.domain || 'taita.blog'
  const url = `https://${blogSubdomain}.${blogDomain}/blog/${post.slug}`
  window.open(url, '_blank')
}

// Obtener el blog activo del localStorage
const loadActiveBlog = async () => {
  try {
    const blog = await getActiveBlog()
    if (blog) {
      activeBlog.value = blog
    }
  } catch (error) {
    console.error('[PostsView] Error al obtener el blog activo:', error)
  }
}

// Función para formatear fechas
const formatDate = (dateString) => {
  if (!dateString) return t('posts.dateUnavailable')
  
  const date = new Date(dateString)
  
  // Verificar si la fecha es válida
  if (isNaN(date.getTime())) return t('posts.invalidDate')
  
  // Formatear la fecha en formato local
  return new Intl.DateTimeFormat(locale.value, {
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
    const blogId = await getCurrentBlogId();
    console.log('[PostsView] Fetching posts for blogId:', blogId);

    // Make a direct fetch call to bypass any axios interceptors
    const token = localStorage.getItem('authToken');
    const response = await fetch(`https://taita-api.onrender.com/api/posts?blogId=${blogId}&includeDrafts=true`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Make sure we have an array
    const postsData = Array.isArray(data) ? data : (data.data || []);

    // Update the ref
    posts.value = postsData;
    console.log('[PostsView] Loaded', posts.value.length, 'posts for blog ID:', blogId);

  } catch (error) {
    console.error('[PostsView] Error in fetchPosts:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  } finally {
    isLoading.value = false;
  }
}

const handleDelete = async (uuid) => {
  if (!confirm(t('posts.deleteConfirm'))) return

  try {
    await api.delete(`/api/posts/uuid/${uuid}`)
    await fetchPosts()
  } catch (error) {
    console.error('Error deleting post:', error)
    alert(t('posts.saveError'))
  }
}

onMounted(() => {
  loadActiveBlog()
  fetchPosts()
})
</script>

<template>
  <ViewLayout>
    <template #title>{{ $t('posts.title') }}</template>
    <template #subtitle>{{ $t('posts.subtitle') }}</template>
    
    <div class="flex justify-between items-center mb-6">
      <div>
        <p v-if="posts.length" class="text-gray-500 text-sm">
          {{ $t('posts.postsFound', { count: posts.length }) }}
        </p>
      </div>
      
      <BaseButton 
        variant="primary" 
        @click="router.push('/cms/posts/new')"
      >
        <span class="flex items-center whitespace-nowrap">
          <Plus class="w-4 h-4 mr-2" />
          {{ $t('posts.addPost') }}
        </span>
      </BaseButton>
    </div>
    
    <div v-if="isLoading" class="py-8 text-center text-gray-500">
      <div class="animate-pulse flex justify-center">
        <div class="h-4 w-24 bg-gray-200 rounded"></div>
      </div>
      <p class="mt-2 text-sm">{{ $t('posts.loadingPosts') }}</p>
    </div>
    
    <div v-else-if="!posts.length" class="py-12 text-center">
      <div class="text-gray-400 mb-3">
        <FileText class="w-10 h-10" />
      </div>
      <h3 class="text-lg font-medium text-gray-700 mb-1">{{ $t('posts.noPostsFound') }}</h3>
      <p class="text-gray-500 text-sm">{{ $t('posts.createFirstPost') }}</p>
    </div>
    
    <BaseTable v-else class="text-sm">
      <template #header>
        <th>{{ $t('common.title') }}</th>
        <th>{{ $t('common.author') }}</th>
        <th>{{ $t('posts.category') }}</th>
        <th>{{ $t('common.status') }}</th>
        <th>{{ $t('posts.lastEdited') }}</th>
        <th>{{ $t('common.actions') }}</th>
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
            <div class="text-sm text-gray-900">{{ post.author?.name || $t('posts.noAuthor') }}</div>
            <div class="text-xs text-gray-500">{{ post.author?.email }}</div>
          </td>
          <td>
            <!-- Categoría sin estilo pill -->
            <div class="text-sm text-gray-900">
              {{ post.category?.name || $t('posts.noCategory') }}
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
              {{ post.status?.toUpperCase() === 'PUBLISHED' ? $t('posts.published') : $t('posts.draft') }}
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
                :title="$t('posts.viewInFrontend')"
              >
                <Eye class="w-4 h-4" />
              </button>
              <button 
                @click="() => router.push(`/cms/posts/${post.uuid}/edit`)" 
                class="p-1 rounded hover:bg-gray-100 text-gray-600 transition-colors"
                :title="$t('common.edit')"
              >
                <Edit class="w-4 h-4" />
              </button>
              <button 
                @click="() => handleDelete(post.uuid)" 
                class="p-1 rounded hover:bg-red-50 text-red-600 transition-colors"
                :title="$t('common.delete')"
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
