<template>
  <div class="superadmin-layout">
    <header class="superadmin-header">
      <h2>Panel de Super Admin</h2>
      <slot name="actions"></slot>
    </header>
    <main class="superadmin-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
// Puedes agregar lógica específica para el super admin aquí
</script>

<style scoped>
.superadmin-layout {
  min-height: 100vh;
  background: #f6fafd;
}
.superadmin-header {
  padding: 1.5rem 2rem 1rem 2rem;
  background: #2b6cb0;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.superadmin-content {
  max-width: 900px;
  margin: 2rem auto 0 auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(43,108,176,0.07);
  padding: 2rem 2.5rem;
}
</style>
