<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ViewLayout from '@/views/ViewLayout.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseTable from '@/components/BaseTable.vue'
import api from '@/utils/api'
import { Plus, FileText, Edit, Trash2 } from 'lucide-vue-next'

const router = useRouter()
const posts = ref([])
const isLoading = ref(false)

const fetchPosts = async () => {
  isLoading.value = true
  try {
    const response = await api.get('/api/posts')
    posts.value = response.data
  } catch (error) {
    console.error('Error fetching posts:', error)
  } finally {
    isLoading.value = false
  }
}

const handleDelete = async (id) => {
  try {
    await api.delete(`/api/posts/${id}`)
    await fetchPosts()
  } catch (error) {
    console.error('Error deleting post:', error)
  }
}

onMounted(() => {
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
        @click="router.push('/posts/new')"
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
    
    <BaseTable v-else>
      <template #header>
        <th>Title</th>
        <th>Slug</th>
        <th>Actions</th>
      </template>
      
      <template #body>
        <tr v-for="post in posts" :key="post.id">
          <td>
            <div class="flex items-center">
              <div class="flex-shrink-0 h-8 w-8 bg-gray-100 rounded flex items-center justify-center text-gray-500">
                <FileText class="w-4 h-4" />
              </div>
              <div class="ml-3">
                <div class="text-sm font-medium text-gray-900">{{ post.title }}</div>
              </div>
            </div>
          </td>
          <td>{{ post.slug }}</td>
          <td>
            <div class="flex gap-2">
              <button 
                @click="() => router.push(`/posts/${post.id}/edit`)" 
                class="p-1.5 rounded hover:bg-gray-100 text-gray-600 transition-colors"
                title="Edit"
              >
                <Edit class="w-4 h-4" />
              </button>
              <button 
                @click="() => handleDelete(post.id)" 
                class="p-1.5 rounded hover:bg-red-50 text-red-600 transition-colors"
                title="Delete"
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