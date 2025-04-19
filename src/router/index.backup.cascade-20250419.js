// Backup generado automáticamente antes de recrear index.js desde cero.
// Fecha: 2025-04-19

/* --- INICIO DEL ARCHIVO ORIGINAL index.js --- */

import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Layout público para landing, login, signup
    {
      path: '/',
      component: () => import('@/layouts/PublicLayout.vue'),
      children: [
        { path: '', name: 'home', component: () => import('@/views/LandingView.vue') },
        { path: 'login', name: 'login', component: () => import('@/views/LoginView.vue') },
        { path: 'signup', name: 'signup', component: () => import('@/views/SignupView.vue') },
      ]
    },
    // Layout para SUPER_ADMIN (por ahora solo /blogs)
    {
      path: '/blogs',
      component: () => import('@/layouts/SuperAdminLayout.vue'),
      children: [
        { path: '', name: 'blogs', component: () => import('@/views/BlogsView.vue'), meta: { requiresAuth: true } }
      ]
    },
    // Layout CMS para usuarios normales
    {
      path: '/',
      component: () => import('@/layouts/CmsLayout.vue'),
      children: [
        { path: 'dashboard', name: 'dashboard', component: () => import('@/views/DashboardView.vue'), meta: { requiresAuth: true } },
        { path: 'about', name: 'about', component: () => import('@/views/AboutView.vue') },
        { path: 'menu', name: 'menu', component: () => import('@/views/MenuView.vue') },
        { path: 'categories', name: 'categories', component: () => import('@/views/CategoriesView.vue'), meta: { requiresAuth: true } },
        { path: 'posts', name: 'posts', component: () => import('@/views/PostsView.vue'), meta: { requiresAuth: true } },
        { path: 'post-form', name: 'post-form', component: () => import('@/views/PostFormView.vue'), meta: { requiresAuth: true } },
        { path: 'pages', name: 'pages', component: () => import('@/views/PagesView.vue'), meta: { requiresAuth: true } },
        { path: 'page-form', name: 'page-form', component: () => import('@/views/PageFormView.vue'), meta: { requiresAuth: true } },
        { path: 'user/edit/:uuid', name: 'edit-user', component: () => import('@/views/UserFormView.vue'), meta: { requiresAuth: true } },
        { path: 'media', name: 'media', component: () => import('@/views/MediaView.vue'), meta: { requiresAuth: true } },
        { path: 'settings', name: 'settings', component: () => import('@/views/SettingsView.vue'), meta: { requiresAuth: true } },
        { path: 'users', name: 'users', component: () => import('@/views/UsersView.vue'), meta: { requiresAuth: true } },
        { path: 'series', name: 'series', component: () => import('@/views/SeriesView.vue'), meta: { requiresAuth: true } },
        { path: 'series-form', name: 'series-form', component: () => import('@/views/SeriesFormView.vue'), meta: { requiresAuth: true } },
        { path: 'profile-picture-test', name: 'profile-picture-test', component: () => import('@/views/ProfilePictureTestView.vue'), meta: { requiresAuth: true } },
        { path: 'comments', name: 'comments', component: () => import('@/views/CommentsView.vue'), meta: { requiresAuth: true } },
      ]
    }
  ]
});

export default router;

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

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Layout público para landing, login, signup
    {
      path: '/',
      component: () => import('@/layouts/PublicLayout.vue'),
      children: [
        { path: '', name: 'home', component: () => import('@/views/LandingView.vue') },
        { path: 'login', name: 'login', component: () => import('@/views/LoginView.vue') },
        { path: 'signup', name: 'signup', component: () => import('@/views/SignupView.vue') },
      ]
    },
    // Layout para SUPER_ADMIN (por ahora solo /blogs)
    {
      path: '/blogs',
      component: () => import('@/layouts/SuperAdminLayout.vue'),
      children: [
        { path: '', name: 'blogs', component: () => import('@/views/BlogsView.vue'), meta: { requiresAuth: true } }
      ]
    },
    // Layout CMS para usuarios normales
    {
      path: '/',
      component: () => import('@/layouts/CmsLayout.vue'),
      children: [
        { path: 'dashboard', name: 'dashboard', component: () => import('@/views/DashboardView.vue'), meta: { requiresAuth: true } },
        { path: 'about', name: 'about', component: () => import('@/views/AboutView.vue') },
        { path: 'menu', name: 'menu', component: () => import('@/views/MenuView.vue') },
        { path: 'categories', name: 'categories', component: () => import('@/views/CategoriesView.vue'), meta: { requiresAuth: true } },
        { path: 'posts', name: 'posts', component: () => import('@/views/PostsView.vue'), meta: { requiresAuth: true } },
        { path: 'post-form', name: 'post-form', component: () => import('@/views/PostFormView.vue'), meta: { requiresAuth: true } },
        { path: 'pages', name: 'pages', component: () => import('@/views/PagesView.vue'), meta: { requiresAuth: true } },
        { path: 'page-form', name: 'page-form', component: () => import('@/views/PageFormView.vue'), meta: { requiresAuth: true } },
        { path: 'media', name: 'media', component: () => import('@/views/MediaView.vue'), meta: { requiresAuth: true } },
        { path: 'settings', name: 'settings', component: () => import('@/views/SettingsView.vue'), meta: { requiresAuth: true } },
        { path: 'users', name: 'users', component: () => import('@/views/UsersView.vue'), meta: { requiresAuth: true } },
        { path: 'user/edit/:uuid', name: 'edit-user', component: () => import('@/views/UserFormView.vue'), meta: { requiresAuth: true } },
        { path: 'series', name: 'series', component: () => import('@/views/SeriesView.vue'), meta: { requiresAuth: true } },
        { path: 'series-form', name: 'series-form', component: () => import('@/views/SeriesFormView.vue'), meta: { requiresAuth: true } },
        { path: 'profile-picture-test', name: 'profile-picture-test', component: () => import('@/views/ProfilePictureTestView.vue'), meta: { requiresAuth: true } },
        { path: 'comments', name: 'comments', component: () => import('@/views/CommentsView.vue'), meta: { requiresAuth: true } },
      ]
    },
  ]
});

export default router;

// ...continúa el archivo original...
