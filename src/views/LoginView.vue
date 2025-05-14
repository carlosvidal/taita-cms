<template>
  <PublicLayout>
    <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-100">
      <div class="bg-white px-8 py-10 rounded-2xl shadow-xl max-w-md w-full">
        <LoginForm />
      </div>
    </div>
  </PublicLayout>
</template>

<script setup>
import LoginForm from '../components/LoginForm.vue'

const handleLogin = async () => {
  try {
    const response = await api.post('/auth/login', {
      email: form.email,
      password: form.password
    });

    // Guarda el token JWT y los datos del usuario por separado
    localStorage.setItem('authToken', response.data.token);
    localStorage.setItem('authUser', JSON.stringify({
      id: response.data.user.id,
      uuid: response.data.user.uuid,
      email: response.data.user.email,
      name: response.data.user.name,
      role: response.data.user.role
    }));
    router.push('/cms/dashboard');
  } catch (error) {
    // ... error handling ...
  }
};
</script>
