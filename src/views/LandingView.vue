<template>
  <div class="landing-container">
    <div class="landing-box">
      <h1 class="landing-title">Bienvenido al CMS de tu Blog</h1>
      <p class="landing-subtitle">Gestiona tu blog de forma sencilla y profesional.</p>
      <div class="landing-actions">
        <router-link to="/login" class="landing-btn landing-btn-login">Iniciar sesión</router-link>
        <router-link to="/signup" class="landing-btn landing-btn-signup">Registrarse</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.landing-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(120deg, #f8fafc 0%, #e0e7ef 100%);
}
.landing-box {
  background: #fff;
  padding: 3rem 2.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 32px rgba(40,60,120,0.07);
  text-align: center;
  max-width: 420px;
}
.landing-title {
  font-size: 2.1rem;
  font-weight: 800;
  color: #2d3748;
  margin-bottom: 0.7rem;
}
.landing-subtitle {
  font-size: 1.15rem;
  color: #4a5568;
  margin-bottom: 2.2rem;
}
.landing-actions {
  display: flex;
  gap: 1.3rem;
  justify-content: center;
}
.landing-btn {
  display: inline-block;
  padding: 0.8rem 2.1rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1.05rem;
  text-decoration: none;
  transition: background 0.18s, color 0.18s, box-shadow 0.18s;
}
.landing-btn-login {
  background: #2b6cb0;
  color: #fff;
  box-shadow: 0 2px 8px rgba(43,108,176,0.07);
}
.landing-btn-login:hover {
  background: #225ea8;
}
.landing-btn-signup {
  background: #fff;
  color: #2b6cb0;
  border: 2px solid #2b6cb0;
}
.landing-btn-signup:hover {
  background: #e6f0fa;
}
</style>
