<script setup>
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { LayoutDashboard, FileText, File, Tag, Menu as MenuIcon, LogOut, X, AlignJustify, Settings, UserCircle, Library } from 'lucide-vue-next'

// Estado para el usuario autenticado
const currentUser = ref(null)

const route = useRoute()
const router = useRouter()
const isMobileMenuOpen = ref(false)
const isMobileView = ref(false)

// Determinar si estamos en la página de login
const isBlogsPage = computed(() => route.path === '/blogs');
const isSignupPage = computed(() => route.path === '/signup');
const isLoginPage = computed(() => {
  return route.path === '/login'
})

// Comprobar si el usuario es administrador
const isAdmin = computed(() => {
  return currentUser.value && currentUser.value.role === 'ADMIN'
})

// Determinar si debemos mostrar el sidebar
const showSidebar = computed(() => {
  // No mostrar sidebar en login, signup ni en selección de blogs
  return !isLoginPage.value && !isSignupPage.value && !isBlogsPage.value
})

// Función para cerrar sesión
const handleLogout = () => {
  // Eliminar el usuario, token y el contexto de blog activo
  localStorage.removeItem('authUser')
  localStorage.removeItem('authToken')
  localStorage.removeItem('activeBlog')

  // Redirigir al usuario a la página de login usando window.location
  // para forzar una recarga completa de la página y evitar problemas con componentes
  window.location.href = '/login'
}

// Función para alternar el menú móvil
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

// Cerrar el menú móvil cuando se cambia de ruta
const closeMobileMenu = () => {
  if (isMobileMenuOpen.value) {
    isMobileMenuOpen.value = false
  }
}

// Verificar si estamos en vista móvil
const checkMobileView = () => {
  isMobileView.value = window.innerWidth < 768
}

// Escuchar cambios de ruta para cerrar el menú móvil
router.afterEach(closeMobileMenu)

// Cargar datos del usuario desde localStorage
const loadUserData = () => {
  try {
    const userData = localStorage.getItem('authUser')
    if (userData) {
      currentUser.value = JSON.parse(userData)
      console.log('Usuario cargado:', currentUser.value)
    }
  } catch (error) {
    console.error('Error al cargar datos de usuario:', error)
  }
}

// Configurar listeners para el tamaño de la ventana y cargar datos del usuario
onMounted(() => {
  checkMobileView()
  window.addEventListener('resize', checkMobileView)
  loadUserData()
})

</script>

<template>
  <RouterView />
</template>

<style>
:root {
  --sidebar-width: 240px;
  --bg-color: #fff;
  --text-color: #333;
  --primary-color: #2563eb;
  --border-color: #e5e7eb;
  --hover-bg: #f3f4f6;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-color: #1a1a1a;
    --text-color: #f3f3f3;
    --border-color: #2d2d2d;
    --hover-bg: #2d2d2d;
  }
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
}

.app-container {
  display: flex;
  width: 100%;
  min-height: 100vh;
  background-color: var(--bg-color);
  color: var(--text-color);
}

/* Estilos específicos para la página de login */
.login-layout {
  display: block;
  background-color: #f9fafb;
}

.login-content {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
  padding: 0;
}

/* Estilos para el sidebar */
.sidebar {
  width: var(--sidebar-width);
  border-right: 1px solid var(--border-color);
  height: 100vh;
  position: sticky;
  top: 0;
  padding: 1.5rem 1rem;
}

.brand {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 2rem;
  padding-left: 0.5rem;
}

.main-nav {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.main-nav ul {
  list-style: none;
  flex-grow: 1;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.375rem;
  text-decoration: none;
  color: var(--text-color);
  transition: background-color 0.2s;
}

.nav-link:hover {
  background-color: var(--hover-bg);
}

.nav-link.router-link-exact-active {
  background-color: var(--hover-bg);
  font-weight: 500;
  color: var(--primary-color);
}

.icon {
  width: 1.1rem;
  height: 1.1rem;
}

/* Estilos para el footer del sidebar y botón de logout */
.sidebar-footer {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.logout-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem;
  border: none;
  background: none;
  border-radius: 0.375rem;
  color: #ef4444;
  font-size: 0.875rem;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s;
}

.logout-button:hover {
  background-color: rgba(239, 68, 68, 0.1);
}

.content-area {
  flex: 1;
  padding: 0.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .content-area {
    padding: 0;
  }
}

/* Estilos para el header móvil */
.mobile-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: var(--bg-color);
  border-bottom: 1px solid var(--border-color);
  z-index: 20;
  padding: 0 1rem;
}

.mobile-header-content {
  height: 100%;
  display: flex;
  align-items: center;
}

.mobile-brand {
  font-size: 1.25rem;
  font-weight: 600;
  margin-left: 1rem;
}

.menu-toggle-button {
  background: none;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 0.375rem;
  cursor: pointer;
  color: var(--text-color);
}

.menu-toggle-button:hover {
  background-color: var(--hover-bg);
}

/* Overlay para cuando el drawer está abierto */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 25;
}

/* Estilos para el sidebar en móviles */
.mobile-sidebar {
  position: fixed;
  top: 0;
  left: -280px;
  /* Inicialmente fuera de la pantalla */
  width: 280px;
  height: 100vh;
  z-index: 30;
  transition: transform 0.3s ease-in-out;
  background-color: var(--bg-color);
  overflow-y: auto;
}

.mobile-sidebar-open {
  transform: translateX(280px);
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
}

/* Ajuste para el contenido principal cuando hay header móvil */
.has-mobile-header {
  padding-top: 80px;
  /* 60px del header + 20px de espacio */
}

/* Media queries para diferentes tamaños de pantalla */
@media (min-width: 768px) {

  /* En pantallas medianas y grandes, el sidebar siempre está visible */
  .sidebar {
    width: var(--sidebar-width);
    height: 100vh;
    position: sticky;
    top: 0;
    border-right: 1px solid var(--border-color);
    border-bottom: none;
    padding: 1.5rem 0;
    overflow-y: auto;
  }

  .main-nav ul {
    display: block;
  }

  .nav-link {
    padding: 0.75rem;
  }
}

@media (max-width: 767px) {
  .login-content {
    height: auto;
    min-height: 100vh;
    padding: 1.5rem;
  }
}
</style>
