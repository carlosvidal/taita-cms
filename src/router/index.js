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

const BlogsView = () => import('../views/BlogsView.vue');

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/blogs',
      name: 'blogs',
      component: BlogsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/',
      name: 'home',
      component: () => import('../views/LandingView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignupView
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
      path: '/pages/:uuid/edit',
      name: 'edit-page',
      component: PageFormView,
      meta: { requiresAuth: true }
    },
    {
      path: '/pages/edit/:uuid',
      name: 'page-edit',
      component: PageFormView,
      meta: { requiresAuth: true }
    },
    {
      path: '/media',
      name: 'media',
      component: MediaView,
      meta: { requiresAuth: true }
    },
    {
      path: '/comments',
      name: 'comments',
      component: CommentsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/series',
      name: 'series',
      component: SeriesView,
      meta: { requiresAuth: true }
    },
    {
      path: '/blogs',
      name: 'blogs',
      component: BlogsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/series/new',
      name: 'new-series',
      component: SeriesFormView,
      meta: { requiresAuth: true }
    },
    {
      path: '/series/:uuid',
      name: 'edit-series',
      component: SeriesFormView,
      meta: { requiresAuth: true }
    },
    {
      path: '/series/:id/edit',
      name: 'series-edit',
      component: SeriesFormView,
      props: true,
      meta: { requiresAuth: true }
    },
    {
      path: '/profile-picture-test',
      name: 'profile-picture-test',
      component: ProfilePictureTestView,
      meta: { requiresAuth: true }
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/users',
      name: 'users',
      component: UsersView,
      meta: { requiresAuth: true }
    },
    {
      path: '/users/new',
      name: 'new-user',
      component: UserFormView,
      meta: { requiresAuth: true }
    },
    {
      path: '/user/edit/:uuid',
      name: 'edit-user',
      component: UserFormView,
      meta: { requiresAuth: true }
    }
  ]
})

// --- GUARDAS DE NAVEGACION PERSONALIZADAS ---
router.beforeEach(async (to, from, next) => {
  const user = JSON.parse(localStorage.getItem('authUser'));
  let selectedBlog = localStorage.getItem('activeBlog');
  const publicPages = ['login', 'signup', 'blogs'];

  if (publicPages.includes(to.name)) {
    return next();
  }

  if (to.meta.requiresAuth && !user) {
    return next({ name: 'login' });
  }

  // Si es SUPER_ADMIN y no tiene blog seleccionado, siempre va a /blogs
  if (user && user.role === 'SUPER_ADMIN' && !selectedBlog) {
    return next({ name: 'blogs' });
  }

  // Si es usuario ADMIN y no tiene blog seleccionado
  if (user && user.role === 'ADMIN' && !selectedBlog) {
    try {
      // Buscar los blogs del usuario
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/blogs?adminId=${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const blogs = await res.json();
      if (Array.isArray(blogs) && blogs.length === 1) {
        localStorage.setItem('activeBlog', blogs[0].uuid);
        return next({ name: 'dashboard' });
      } else {
        // Multi-blog: fuerza selección
        return next({ name: 'blogs' });
      }
    } catch (e) {
      return next({ name: 'blogs' });
    }
  }

  next();
});

export default router
