import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import MenuView from '../views/MenuView.vue'
import CategoriesView from '../views/CategoriesView.vue'
import PostsView from '../views/PostsView.vue'
import PostFormView from '../views/PostFormView.vue'
import PagesView from '../views/PagesView.vue'
import PageFormView from '../views/PageFormView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/dashboard' // Redirect root to dashboard
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true } // This will be used for route protection
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/menu',
      name: 'menu',
      component: MenuView
    },
    {
      path: '/categories',
      name: 'categories',
      component: CategoriesView,
      meta: { requiresAuth: true }
    },
    {
      path: '/posts',
      name: 'posts',
      component: PostsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/posts/new',
      name: 'new-post',
      component: PostFormView,
      meta: { requiresAuth: true }
    },
    {
      path: '/posts/:id/edit',
      name: 'edit-post',
      component: PostFormView,
      meta: { requiresAuth: true }
    },
    {
      path: '/pages',
      name: 'pages',
      component: PagesView,
      meta: { requiresAuth: true }
    },
    {
      path: '/pages/new',
      name: 'new-page',
      component: PageFormView,
      meta: { requiresAuth: true }
    },
    {
      path: '/pages/:id/edit',
      name: 'edit-page',
      component: PageFormView,
      meta: { requiresAuth: true }
    }
  ]
})

export default router
