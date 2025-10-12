<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-100">
    <!-- Header -->
    <header class="sticky top-0 z-30 w-full bg-white/80 backdrop-blur border-b border-slate-200">
      <div class="max-w-5xl mx-auto flex items-center justify-between px-4 py-3 sm:px-8">
        <router-link to="/" class="flex items-center">
          <img src="@/assets/taita-logo.svg" alt="Taita" class="h-8 w-auto" />
        </router-link>
        <!-- Nav: hidden on mobile, flex on md+ -->
        <nav class="hidden md:flex gap-6 text-slate-700 text-base font-medium">
          <router-link to="/login" class="hover:text-blue-700 transition">Iniciar sesión</router-link>
          <router-link to="/signup" class="hover:text-blue-700 transition">Registrarse</router-link>
          <router-link to="/about" class="hover:text-blue-700 transition">Acerca</router-link>
        </nav>
        <!-- Hamburger menu: visible on mobile -->
        <div class="md:hidden">
          <button @click="showMenu = !showMenu" aria-label="Abrir menú"
            class="p-2 rounded hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400">
            <svg class="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
      <!-- Mobile menu -->
      <transition name="fade">
        <nav v-if="showMenu" class="md:hidden bg-white border-t border-slate-200 px-4 pb-4">
          <router-link to="/login" class="block py-2 text-slate-700 hover:text-blue-700"
            @click="showMenu = false">Iniciar sesión</router-link>
          <router-link to="/signup" class="block py-2 text-slate-700 hover:text-blue-700"
            @click="showMenu = false">Registrarse</router-link>
          <router-link to="/about" class="block py-2 text-slate-700 hover:text-blue-700"
            @click="showMenu = false">Acerca</router-link>
        </nav>
      </transition>
    </header>
    <!-- Main content -->
    <main class="flex-1 flex flex-col items-center w-full px-2 sm:px-4 py-6 sm:py-10">
      <router-view />
    </main>
    <!-- Footer -->
    <footer class="bg-white/80 border-t border-slate-200 text-center text-slate-500 py-4 text-sm mt-6">
      {{ year }} Taita Blog. Todos los derechos reservados.
    </footer>
  </div>
</template>

<script setup>
// Layout simple para landing, login, signup
import { ref } from 'vue'
const showMenu = ref(false)
const year = new Date().getFullYear()
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<style scoped>
:host {
  display: block;
}
</style>
