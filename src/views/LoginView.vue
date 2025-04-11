<template>
  <div class="login-container">
    <LoginForm />
  </div>
</template>

<script setup>
import LoginForm from '../components/LoginForm.vue'

const handleLogin = async () => {
  try {
    const response = await api.post('/auth/login', {
      email: form.email,
      password: form.password
    });

    // In your login success handler:
    localStorage.setItem('authUser', JSON.stringify({
      id: response.data.user.id,
      name: response.data.user.name,
      token: response.data.token
    }));

    router.push('/dashboard');
  } catch (error) {
    // ... error handling ...
  }
};
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