<script setup>
import { computed } from 'vue'
import BaseTable from '@/components/BaseTable.vue'

import { ref, onMounted } from 'vue'
import ViewLayout from './ViewLayout.vue'
import BaseButton from '@/components/BaseButton.vue'
import BlogModal from '@/components/BlogModal.vue'
import api from '@/utils/api'
import { Plus, LayoutDashboard, Eye, LogIn, Settings } from 'lucide-vue-next'

const blogs = ref([])
const showModal = ref(false)
const currentBlog = ref(null)

function viewBlog(blog) {
  // Abrir blog en nueva pestaña
  const url = blog.domain ? `https://${blog.domain}` : `https://${blog.subdomain}.tudominio.com`;
  window.open(url, '_blank');
}

function openSettings(blog) {
  currentBlog.value = blog;
  showModal.value = true;
}

// selectBlog ya está implementado, solo actualiza activeBlog y redirige
const isLoading = ref(false)
const error = ref('')

const fetchBlogs = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await api.get('/api/blogs');
    blogs.value = response.data;
  } catch (err) {
    error.value = err.response?.data?.message ||
      'No se pudo conectar al servidor. Intenta nuevamente.';
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
    error.value = err.response?.data?.message || err.response?.data?.error || 'Error al guardar blog'
    console.error('Save Error:', err)
  }
}

const selectBlog = (blog) => {
  // Guarda solo el UUID del blog en localStorage (clave 'activeBlog')
  localStorage.setItem('activeBlog', blog.uuid);
  // Redirige al dashboard del CMS (ruta válida)
  window.location.href = '/cms/dashboard';
}

const user = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('authUser')) || {};
  } catch {
    return {};
  }
});
const isSuperAdmin = computed(() => user.value.role === 'SUPER_ADMIN');

onMounted(() => {
  if (user.value && user.value.id) {
    fetchBlogs();
  }
})
</script>

<template>
  <div class="blogs-select-container" style="
    max-width: 700px;
    margin: 3rem auto 0 auto;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    padding: 2.5rem 2rem 2rem 2rem;
  ">
    <div class="blogs-header flex items-center justify-between mb-6" style="
      margin-bottom: 2rem;
    ">
      <h1 class="blogs-title" style="
        font-size: 1.45rem;
        font-weight: 700;
        color: #222;
        margin: 0;
      ">Selecciona un blog</h1>
      <BaseButton v-if="isAdmin" @click="handleCreate" color="primary" class="new-blog-btn" style="
        margin-left: auto;
        margin-bottom: 0;
      ">
        <Plus class="icon" /> Nuevo Blog
      </BaseButton>
    </div>
    <div v-if="error" class="error mb-4">{{ error }}</div>
    <div v-if="isLoading" class="py-8 text-center text-gray-500">Cargando blogs...</div>
    <BaseTable v-else :empty="blogs.length === 0" :col-span="4">
      <template #header>
        <th>Nombre</th>
        <th>Subdominio</th>
        <th>Dominio</th>
        <th>Plan</th>
        <th class="text-right">Acciones</th>
      </template>
      <template #body>
        <tr v-for="blog in blogs" :key="blog.id" class="blog-row">
          <td class="font-semibold">{{ blog.name }}</td>
          <td>{{ blog.subdomain ? blog.subdomain + '.tudominio.com' : '-' }}</td>
          <td>{{ blog.domain || '-' }}</td>
          <td>{{ blog.plan || '-' }}</td>
          <td class="flex gap-2 justify-end">
            <button @click.stop="viewBlog(blog)" class="action-btn" title="Ver blog">
              <Eye class="w-5 h-5" />
            </button>
            <button @click.stop="selectBlog(blog)" class="action-btn" title="Entrar al CMS">
              <LogIn class="w-5 h-5" />
            </button>
            <button v-if="isSuperAdmin" @click.stop="openSettings(blog)" class="action-btn" title="Configuraciones">
              <Settings class="w-5 h-5" />
            </button>
          </td>
        </tr>
      </template>
      <template #empty>
        No hay blogs registrados.
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
