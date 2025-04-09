<template>
  <div class="login-container">
    <LoginForm />
  </div>
</template>

<script setup>
import LoginForm from '../components/LoginForm.vue'
</script>

<style scoped>
.login-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>