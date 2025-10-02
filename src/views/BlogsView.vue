<script setup>
import { computed, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseTable from '@/components/BaseTable.vue'
import ViewLayout from './ViewLayout.vue'
import BaseButton from '@/components/BaseButton.vue'
import BlogModal from '@/components/BlogModal.vue'
import api from '@/utils/api'
import { Plus, LayoutDashboard, Eye, LogIn, Settings } from 'lucide-vue-next'
import router from '@/router'

const { t } = useI18n()
const blogs = ref([])
const showModal = ref(false)
const currentBlog = ref(null)

function viewBlog(blog) {
  const url = blog.domain ? `https://${blog.subdomain}.${blog.domain}` : `https://${blog.subdomain}.taita.blog`;
  window.open(url, '_blank');
}

function openSettings(blog) {
  currentBlog.value = blog;
  showModal.value = true;
}

const isLoading = ref(false)
const error = ref('')

const fetchBlogs = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await api.get('/api/blogs');
    blogs.value = response.data;
  } catch (err) {
    error.value = err.response?.data?.message || t('errors.serverConnection');
    console.error('API Error:', err);
  } finally {
    isLoading.value = false;
  }
}

const handleCreate = () => {
  currentBlog.value = null
  showModal.value = true
}

const handleSave = async (blogData) => {
  try {
    if (blogData.uuid) {
      await api.patch(`/api/blogs/uuid/${blogData.uuid}`, blogData)
    } else if (blogData.id) {
      await api.patch(`/api/blogs/${blogData.id}`, blogData)
    } else {
      await api.post('/api/blogs', blogData)
    }
    await fetchBlogs()
    showModal.value = false
  } catch (err) {
    error.value = err.response?.data?.message || err.response?.data?.error || t('blogs.saveError')
    console.error('Save Error:', err)
  }
}

const selectBlog = async (blog) => {
  try {
    localStorage.setItem('activeBlog', blog.uuid);
    router.push({ name: 'dashboard' });
  } catch (error) {
    console.error('Error al seleccionar blog:', error);
    alert(t('blogs.selectError', { error: error.response?.status || error.message }));
    fetchBlogs();
  }
}

const user = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('authUser')) || {};
  } catch {
    return {};
  }
});
const isSuperAdmin = computed(() => user.value.role === 'SUPER_ADMIN');

const resetActiveBlog = () => {
  localStorage.removeItem('activeBlog');
  alert(t('blogs.selectionReset'));
  fetchBlogs();
};

onMounted(() => {
  const oldActiveBlog = localStorage.getItem('activeBlog');
  localStorage.removeItem('activeBlog');
  console.log('Se ha limpiado la selección de blog automáticamente. Valor anterior:', oldActiveBlog);
  
  if (user.value && user.value.id) {
    fetchBlogs();
  } else {
    console.log('No hay usuario autenticado o falta ID');
  }
})
</script>

<template>
  <div class="blogs-select-container" >
    <div class="blogs-header flex items-center justify-between mb-6" style="margin-bottom: 2rem;">
      <div class="flex items-center">
        <h1 class="blogs-title" style="font-size: 1.45rem; font-weight: 700; color: #222; margin: 0;">{{ $t('blogs.selectBlog') }}</h1>
        <button 
          @click="resetActiveBlog" 
          class="ml-4 px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-800 rounded-md transition-colors"
          :title="$t('blogs.resetSelectionTooltip')"
        >
          {{ $t('blogs.resetSelection') }}
        </button>
      </div>
      <BaseButton v-if="isSuperAdmin" @click="handleCreate" color="primary" class="new-blog-btn" style="margin-left: auto; margin-bottom: 0;">
        <Plus class="icon" /> {{ $t('blogs.newBlog') }}
      </BaseButton>
    </div>
    <div v-if="error" class="error mb-4">{{ error }}</div>
    <div v-if="isLoading" class="py-8 text-center text-gray-500">{{ $t('blogs.loading') }}</div>
    <BaseTable v-else :empty="blogs.length === 0" :col-span="4">
      <template #header>
        <th>{{ $t('common.name') }}</th>
        <th>{{ $t('blogs.subdomain') }}</th>
        <th>{{ $t('settings.domain') }}</th>
        <th>{{ $t('settings.plan') }}</th>
        <th class="text-right">{{ $t('common.actions') }}</th>
      </template>
      <template #body>
        <tr v-for="blog in blogs" :key="blog.id" class="blog-row">
          <td class="font-semibold">{{ blog.name }}</td>
          <td>{{ blog.subdomain ? blog.subdomain + '.' + (blog.domain || 'taita.blog') : '-' }}</td>
          <td>{{ blog.domain || '-' }}</td>
          <td>{{ blog.plan || '-' }}</td>
          <td class="flex gap-2 justify-end">
            <button @click.stop="viewBlog(blog)" class="action-btn" :title="$t('blogs.viewBlog')">
              <Eye class="w-5 h-5" />
            </button>
            <button @click.stop="selectBlog(blog)" class="action-btn" :title="$t('blogs.enterCms')">
              <LogIn class="w-5 h-5" />
            </button>
            <button v-if="isSuperAdmin" @click.stop="openSettings(blog)" class="action-btn" :title="$t('settings.title')">
              <Settings class="w-5 h-5" />
            </button>
          </td>
        </tr>
      </template>
      <template #empty>
        {{ $t('blogs.noBlogs') }}
      </template>
    </BaseTable>
    <BlogModal v-if="showModal" :blog="currentBlog" @save="handleSave" @close="showModal = false" />
  </div>
</template>

<style scoped>
.blog-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.blog-item {
  padding: 0.75rem 0;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.blog-name {
  font-weight: 600;
}

.blog-subdomain,
.blog-domain,
.plan {
  font-size: 0.95em;
  color: #888;
}

.error {
  color: #c00;
  margin-bottom: 1rem;
}
</style>