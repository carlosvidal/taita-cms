<template>
  <div class="bg-white px-8 py-10 rounded-2xl shadow-xl max-w-md w-full">
    <h2 class="text-2xl font-bold mb-4 text-center">{{ $t('signup.title') }}</h2>
    <form v-if="step === 1" @submit.prevent="onRequestOtp">
      <label class="block mb-2 font-semibold">{{ $t('common.email') }}</label>
      <input v-model="email" type="email" class="input mb-4" required />
      <div class="mb-4">
        <component is="cap-widget" id="cap" ref="capWidget" :data-cap-api-endpoint="getApiEndpoint()"
          @solve="onCapSolve" />
      </div>
      <button class="btn w-full" :disabled="loading || !capValidated">{{ $t('signup.requestOtp') }}</button>
      <p v-if="error" class="text-red-500 mt-2">{{ error }}</p>
    </form>
    <form v-else-if="step === 2" @submit.prevent="verifyOtp">
      <label class="block mb-2 font-semibold">{{ $t('signup.otpLabel') }}</label>
      <input v-model="otp" type="text" class="input mb-4" required />
      <button class="btn w-full" :disabled="loading">{{ $t('signup.verifyOtp') }}</button>
      <p v-if="error" class="text-red-500 mt-2">{{ error }}</p>
    </form>
    <form v-else-if="step === 3" @submit.prevent="signup">
      <label class="block mb-2 font-semibold">{{ $t('common.name') }}</label>
      <input v-model="name" type="text" class="input mb-4" required />
      <label class="block mb-2 font-semibold">{{ $t('common.password') }}</label>
      <input v-model="password" type="password" class="input mb-4" required />
      <label class="block mb-2 font-semibold">{{ $t('signup.blogName') }}</label>
      <input v-model="blogName" type="text" class="input mb-4" required />
      <label class="block mb-2 font-semibold">{{ $t('blogs.subdomain') }}</label>
      <input v-model="subdomain" type="text" class="input mb-4" required />
      <button class="btn w-full" :disabled="loading">{{ $t('signup.createAccount') }}</button>
      <p v-if="error" class="text-red-500 mt-2">{{ error }}</p>
    </form>
    <div v-else-if="success" class="text-green-600 text-center font-semibold">
      {{ $t('signup.success') }}
    </div>
  </div>
</template>

<script setup>
defineOptions({ inheritAttrs: false })
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const capWidget = ref(null)
const capValidated = ref(false)
const capToken = ref(null)

function onCapSolve(e) {
  capValidated.value = true
  capToken.value = e.detail.token
}

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

const getApiEndpoint = () => {
  const isProduction = window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1');
  let apiUrl = isProduction 
    ? 'https://taita-api.onrender.com' 
    : (import.meta.env.VITE_API_URL || 'http://localhost:3000');
  return `${apiUrl}/api/`;
}

const onRequestOtp = async () => {
  captchaError.value = ''
  if (!validate(captchaAnswer.value)) {
    captchaError.value = t('signup.captchaError')
    generate()
    return
  }
  loading.value = true
  error.value = ''
  try {
    const apiUrl = getApiEndpoint().replace('/api/', '');
    await axios.post(`${apiUrl}/api/auth/request-otp`, { email: email.value })
    step.value = 2
  } catch (e) {
    error.value = e.response?.data?.error || t('signup.otpRequestError')
  } finally {
    loading.value = false
  }
}

const verifyOtp = async () => {
  loading.value = true
  error.value = ''
  try {
    const apiUrl = getApiEndpoint().replace('/api/', '');
    await axios.post(`${apiUrl}/api/auth/verify-otp`, { email: email.value, code: otp.value })
    step.value = 3
  } catch (e) {
    error.value = e.response?.data?.error || t('signup.otpError')
  } finally {
    loading.value = false
  }
}

const signup = async () => {
  loading.value = true
  error.value = ''
  try {
    const apiUrl = getApiEndpoint().replace('/api/', '');
    await axios.post(`${apiUrl}/api/auth/signup`, {
      email: email.value,
      password: password.value,
      name: name.value,
      blogName: blogName.value,
      subdomain: subdomain.value,
    })
    success.value = true
    step.value = 4
  } catch (e) {
    error.value = e.response?.data?.error || t('signup.signupError')
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