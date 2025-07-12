<template>
  <ViewLayout>
    <template #title>About</template>
    <div class="flex min-h-[60vh] items-center justify-center">
      <div class="bg-white dark:bg-gray-800 px-8 py-10 rounded-2xl shadow-xl max-w-md w-full text-center transition-colors">
        <h1 class="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-4">Acerca de Taita Blog</h1>
        <p class="text-slate-700 dark:text-gray-300 mb-6">
          Taita Blog es una plataforma moderna y sencilla para crear, publicar y gestionar tu propio blog de manera profesional.
        </p>
        <router-link to="/" class="text-blue-600 dark:text-blue-400 hover:underline">Volver al inicio</router-link>
      </div>
    </div>
  </ViewLayout>
</template>
