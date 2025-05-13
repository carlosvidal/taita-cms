<template>
  <div class="cms-layout">
    <aside class="sidebar">
      <nav class="main-nav">
        <h1 class="brand">CMS</h1>
        <ul>
          <li>
            <RouterLink to="/cms/dashboard" class="nav-link">
              <LayoutDashboard class="icon" />
              <span>Dashboard</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/cms/posts" class="nav-link">
              <FileText class="icon" />
              <span>Posts</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/cms/comments" class="nav-link">
              <MessageSquare class="icon" />
              <span>Comentarios</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/cms/categories" class="nav-link">
              <Tag class="icon" />
              <span>Categorías</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/cms/series" class="nav-link">
              <Library class="icon" />
              <span>Series</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/cms/pages" class="nav-link">
              <File class="icon" />
              <span>Páginas</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/cms/menu" class="nav-link">
              <MenuIcon class="icon" />
              <span>Menu</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/cms/media" class="nav-link">
              <Image class="icon" />
              <span>Medios</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink :to="`/cms/user/edit/${userUuid}`" class="nav-link">
              <UserCircle class="icon" />
              <span>Mi perfil</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/cms/settings" class="nav-link">
              <Settings class="icon" />
              <span>Configuración</span>
            </RouterLink>
          </li>
          <!-- Botón para super administradores para acceder a la lista de blogs -->
          <li v-if="userRole === 'SUPER_ADMIN'">
            <RouterLink to="/super-admin/blogs" class="nav-link super-admin-link">
              <Database class="icon" />
              <span>Gestionar Blogs</span>
            </RouterLink>
          </li>
        </ul>
        <div class="sidebar-footer">
          <button @click="handleLogout" class="logout-button">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span>Cerrar sesión</span>
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
import { ref, onMounted } from 'vue';
import { LayoutDashboard, FileText, File, Tag, Menu as MenuIcon, Settings, UserCircle, Library, MessageSquare, Image, Database } from 'lucide-vue-next';

const userRole = ref('');
const userUuid = ref('');
onMounted(() => {
  try {
    const user = JSON.parse(localStorage.getItem('authUser'));
    userRole.value = user?.role || '';
    userUuid.value = user?.uuid || '';
  } catch {
    userRole.value = '';
    userUuid.value = '';
  }
});

function handleLogout() {
  localStorage.removeItem('authUser');
  localStorage.removeItem('authToken');
  localStorage.removeItem('activeBlog');
  window.location.href = '/login';
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
