<template>
  <PublicLayout>
    <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-100">
      <div class="bg-white px-8 py-10 rounded-2xl shadow-xl max-w-md w-full">
        <h2 class="text-2xl font-bold mb-4 text-center">Crear cuenta y blog</h2>
    <form v-if="step === 1" @submit.prevent="requestOtp">
      <label class="block mb-2 font-semibold">Email</label>
      <input v-model="email" type="email" class="input mb-4" required />
      <button class="btn w-full" :disabled="loading">Solicitar código</button>
      <p v-if="error" class="text-red-500 mt-2">{{ error }}</p>
    </form>
      </div>
    </div>
  </PublicLayout>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const email = ref('')
const otp = ref('')
const name = ref('')
const password = ref('')
const blogName = ref('')
const subdomain = ref('')
const step = ref(1)
const loading = ref(false)
const error = ref('')
const success = ref(false)
const router = useRouter()

const requestOtp = async () => {
  loading.value = true
  error.value = ''
  try {
    await axios.post('/api/auth/request-otp', { email: email.value })
    step.value = 2
  } catch (e) {
    error.value = e.response?.data?.error || 'Error solicitando código.'
  } finally {
    loading.value = false
  }
}

const verifyOtp = async () => {
  loading.value = true
  error.value = ''
  try {
    await axios.post('/api/auth/verify-otp', { email: email.value, code: otp.value })
    step.value = 3
  } catch (e) {
    error.value = e.response?.data?.error || 'Código incorrecto.'
  } finally {
    loading.value = false
  }
}

const signup = async () => {
  loading.value = true
  error.value = ''
  try {
    await axios.post('/api/auth/signup', {
      email: email.value,
      password: password.value,
      name: name.value,
      blogName: blogName.value,
      subdomain: subdomain.value
    })
    success.value = true
    setTimeout(() => router.push('/login'), 1500)
  } catch (e) {
    error.value = e.response?.data?.error || 'Error en el registro.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.input {
  @apply border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500;
}
.btn {
  @apply bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 transition;
}
</style>
