<template>
  <div class="profile-picture-test-view">
    <h1>Prueba de carga de imágenes de perfil</h1>
    <p>Esta página es solo para probar la carga de imágenes de perfil con una implementación alternativa.</p>
    
    <ProfilePictureTest />
  </div>
</template>

<script setup>
import ProfilePictureTest from '../components/ProfilePictureTest.vue'
</script>

<style scoped>
.profile-picture-test-view {
  padding: 20px;
}

h1 {
  margin-bottom: 20px;
}
</style>
