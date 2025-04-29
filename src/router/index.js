import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import SignupView from '../views/SignupView.vue'
import MenuView from '../views/MenuView.vue'
import CategoriesView from '../views/CategoriesView.vue'
import PostsView from '../views/PostsView.vue'
import PostFormView from '../views/PostFormView.vue'
import PagesView from '../views/PagesView.vue'
import PageFormView from '../views/PageFormView.vue'
import MediaView from '../views/MediaView.vue'
import SettingsView from '../views/SettingsView.vue'
import UsersView from '../views/UsersView.vue'
import UserFormView from '../views/UserFormView.vue'
import SeriesView from '../views/SeriesView.vue'
import SeriesFormView from '../views/SeriesFormView.vue'
import ProfilePictureTestView from '../views/ProfilePictureTestView.vue'
import CommentsView from '../views/CommentsView.vue'
import PublicLayout from '../layouts/PublicLayout.vue'
import SuperAdminLayout from '../layouts/SuperAdminLayout.vue'
import CmsLayout from '../layouts/CmsLayout.vue'
import BlogsView from '../views/BlogsView.vue'
import LandingView from '../views/LandingView.vue'
import ForgotPassword from '../views/ForgotPassword.vue'
import ResetPassword from '../views/ResetPassword.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Layout público para landing, login, signup
    {
      path: '/',
      component: PublicLayout,
      children: [
        { path: '', name: 'home', component: LandingView },
        { path: 'login', name: 'login', component: LoginView },
        { path: 'signup', name: 'signup', component: SignupView },
        { path: 'blogs', name: 'blogs', component: BlogsView },
        { path: 'forgot-password', name: 'forgot-password', component: ForgotPassword },
        { path: 'reset-password', name: 'reset-password', component: ResetPassword },
      ],
    },
    // Layout para SUPER_ADMIN
    {
      path: '/super-admin',
      component: SuperAdminLayout,
      meta: { requiresAuth: true, role: 'SUPER_ADMIN' },
      children: [{ path: 'blogs', name: 'super-admin-blogs', component: BlogsView }],
    },
    // Layout CMS para usuarios normales
    {
      path: '/cms',
      component: CmsLayout,
      meta: { requiresAuth: true },
      children: [
        { path: 'dashboard', name: 'dashboard', component: DashboardView },
        { path: 'menu', name: 'menu', component: MenuView },
        { path: 'categories', name: 'categories', component: CategoriesView },
        { path: 'posts', name: 'posts', component: PostsView },
        { path: 'posts/new', name: 'new-post', component: PostFormView, props: true },
        { path: 'posts/:id/edit', name: 'edit-post', component: PostFormView },
        { path: 'pages', name: 'pages', component: PagesView },
        { path: 'pages/new', name: 'new-page', component: PageFormView, props: true },
        { path: 'pages/:uuid/edit', name: 'edit-page', component: PageFormView },
        { path: 'pages/edit/:uuid', name: 'page-edit', component: PageFormView },
        { path: 'media', name: 'media', component: MediaView },
        { path: 'comments', name: 'comments', component: CommentsView },
        { path: 'series', name: 'series', component: SeriesView },
        { path: 'series/new', name: 'new-series', component: SeriesFormView },
        { path: 'series/:uuid', name: 'edit-series', component: SeriesFormView },
        { path: 'series/:id/edit', name: 'series-edit', component: SeriesFormView, props: true },
        {
          path: 'profile-picture-test',
          name: 'profile-picture-test',
          component: ProfilePictureTestView,
        },
        { path: 'settings', name: 'settings', component: SettingsView },
        { path: 'users', name: 'users', component: UsersView },
        { path: 'users/new', name: 'new-user', component: UserFormView },
        { path: 'user/edit/:uuid', name: 'edit-user', component: UserFormView, props: true },
      ],
    },
  ],
})

// --- GUARDAS DE NAVEGACION PERSONALIZADAS ---
router.beforeEach(async (to, from, next) => {
  const user = JSON.parse(localStorage.getItem('authUser'))
  let selectedBlog = localStorage.getItem('activeBlog')
  const publicPages = ['login', 'signup', 'blogs']

  if (publicPages.includes(to.name)) {
    return next()
  }

  if (to.meta.requiresAuth && !user) {
    return next({ name: 'login' })
  }

  if (to.meta.role && user.role !== to.meta.role) {
    return next({ name: 'dashboard' })
  }

  // Si es SUPER_ADMIN y no tiene blog seleccionado, solo redirige si no está ya en super-admin-blogs
  if (user && user.role === 'SUPER_ADMIN' && !selectedBlog) {
    if (to.name !== 'super-admin-blogs') {
      return next({ name: 'super-admin-blogs' })
    }
    // Si ya está en super-admin-blogs, permite continuar
    return next()
  }

  // Si es usuario ADMIN y no tiene blog seleccionado
  if (user && user.role === 'ADMIN' && !selectedBlog) {
    try {
      // Buscar los blogs del usuario
      const token = localStorage.getItem('authToken')
      const res = await fetch(`/api/blogs?adminId=${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const blogs = await res.json()
      if (Array.isArray(blogs) && blogs.length === 1) {
        localStorage.setItem('activeBlog', blogs[0].uuid)
        return next({ name: 'dashboard' })
      } else {
        // Multi-blog: fuerza selección
        return next({ name: 'blogs' })
      }
    } catch (e) {
      return next({ name: 'blogs' })
    }
  }

  next()
})

export default router
