<template>
  <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-100">
    <div class="bg-white px-8 py-10 rounded-2xl shadow-xl max-w-md w-full text-center">
      <h1 class="text-3xl font-extrabold text-slate-800 mb-2">Bienvenido al CMS de tu Blog</h1>
      <p class="text-lg text-slate-600 mb-8">Gestiona tu blog de forma sencilla y profesional.</p>
      <div class="flex gap-4 justify-center">
        <router-link to="/login" class="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg shadow hover:bg-blue-700 transition">Iniciar sesión</router-link>
        <router-link to="/signup" class="border-2 border-blue-600 text-blue-700 font-semibold py-2 px-6 rounded-lg bg-white hover:bg-blue-50 transition">Registrarse</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import PublicLayout from '@/layouts/PublicLayout.vue'
</script>

<style scoped>

</style>
