<template>
  <div class="cms-layout">
    <aside class="sidebar">
      <nav class="main-nav">
        <div class="brand">
          <img src="@/assets/taita-logo.svg" alt="Taita" class="brand-logo" />
        </div>
        <ul>
          <li>
            <RouterLink to="/cms/dashboard" class="nav-link">
              <LayoutDashboard class="icon" />
              <span>{{ $t('nav.dashboard') }}</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/cms/posts" class="nav-link">
              <FileText class="icon" />
              <span>{{ $t('nav.posts') }}</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/cms/comments" class="nav-link">
              <MessageSquare class="icon" />
              <span>{{ $t('nav.comments') }}</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/cms/categories" class="nav-link">
              <Component class="icon" />
              <span>{{ $t('nav.categories') }}</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/cms/tags" class="nav-link">
              <Tag class="icon" />
              <span>{{ $t('nav.tags') }}</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/cms/series" class="nav-link">
              <Library class="icon" />
              <span>{{ $t('nav.series') }}</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/cms/pages" class="nav-link">
              <File class="icon" />
              <span>{{ $t('nav.pages') }}</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/cms/menu" class="nav-link">
              <MenuIcon class="icon" />
              <span>{{ $t('nav.menu') }}</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/cms/media" class="nav-link">
              <Image class="icon" />
              <span>{{ $t('nav.media') }}</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink :to="`/cms/user/edit/${userUuid}`" class="nav-link">
              <UserCircle class="icon" />
              <span>{{ $t('users.editUser') }}</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/cms/settings" class="nav-link">
              <Settings class="icon" />
              <span>{{ $t('nav.settings') }}</span>
            </RouterLink>
          </li>
          <!-- Botón para super administradores para acceder a la lista de blogs -->
          <li v-if="userRole === 'SUPER_ADMIN'">
            <RouterLink to="/super-admin/blogs" class="nav-link super-admin-link">
              <Database class="icon" />
              <span>{{ $t('nav.blogs') }}</span>
            </RouterLink>
          </li>
        </ul>
        <div class="sidebar-footer">
          <a v-if="activeBlogUrl" :href="activeBlogUrl" target="_blank" class="view-blog-button">
            <Eye class="icon" />
            <span>{{ $t('blogs.viewBlog') }}</span>
          </a>
          <button @click="handleLogout" class="logout-button">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span>{{ $t('nav.logout') }}</span>
          </button>
        </div>
      </nav>
    </aside>
    <main class="cms-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router';
import { ref, onMounted, computed } from 'vue';
import router from '@/router';
import { LayoutDashboard, FileText, File, Tag, Menu as MenuIcon, Settings, UserCircle, Library, MessageSquare, Image, Database, Eye, Component } from 'lucide-vue-next';
import api from '@/utils/api';

const userRole = ref('');
const userUuid = ref('');
const activeBlog = ref(null);

// URL del blog activo
const activeBlogUrl = computed(() => {
  if (!activeBlog.value) return null;
  
  // Si el blog tiene un dominio personalizado, usarlo
  if (activeBlog.value.domain) {
    return `https://${activeBlog.value.domain}`;
  }
  
  // Si no tiene dominio personalizado, usar el subdominio en taita.blog
  if (activeBlog.value.subdomain) {
    return `https://${activeBlog.value.subdomain}.taita.blog`;
  }
  
  // Si no tiene ni dominio ni subdominio, usar la URL principal
  return 'https://www.taita.blog';
});

onMounted(async () => {
  try {
    const user = JSON.parse(localStorage.getItem('authUser'));
    userRole.value = user?.role || '';
    userUuid.value = user?.uuid || '';
    
    // Obtener el UUID del blog activo
    const activeBlogUuid = localStorage.getItem('activeBlog');
    
    if (activeBlogUuid) {
      try {
        // Obtener la información del blog activo
        const response = await api.get(`/api/blogs/uuid/${activeBlogUuid}`);
        activeBlog.value = response.data;
        console.log('Blog activo:', activeBlog.value);
      } catch (error) {
        console.error('Error al obtener información del blog:', error);
      }
    }
  } catch {
    userRole.value = '';
    userUuid.value = '';
  }
});

function handleLogout() {
  localStorage.removeItem('authUser');
  localStorage.removeItem('authToken');
  localStorage.removeItem('activeBlog');
  router.push({ name: 'login' });
}
</script>

<style scoped>
.cms-layout {
  display: flex;
  min-height: 100vh;
}

.cms-content {
  flex: 1;
  background: #f8fafc;
  padding: 2rem 0;
  transition: background-color 0.2s ease;
}

.brand {
  padding: 0.5rem;
  margin-bottom: 2rem;
}

.brand-logo {
  width: 100%;
  height: auto;
  max-width: 180px;
}

.view-blog-button,
.logout-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #1f2937;
  cursor: pointer;
  padding: 10px;
  width: 100%;
  text-align: left;
  transition: all 0.2s;
  text-decoration: none;
  margin-bottom: 5px;
  border-radius: 0.375rem;
}

.view-blog-button:hover,
.logout-button:hover {
  background-color: #e5e7eb;
}

.view-blog-button {
  color: #10b981;
}

.logout-button {
  color: #dc2626;
}

/* Estilo para el botón de super administrador */
.super-admin-link {
  background-color: #4f46e5;
  color: white;
  border-radius: 0.375rem;
  margin-top: 1rem;
}

.super-admin-link:hover {
  background-color: #4338ca;
}
</style>
