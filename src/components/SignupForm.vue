<template>
  <div class="signup-form-container">
    <div class="signup-logo">
      <img src="@/assets/taita-logo.svg" alt="Taita" />
    </div>
    <h2 class="text-2xl font-bold mb-4 text-center">{{ $t('signup.title') }}</h2>

    <!-- Step 1: Email + Captcha -->
    <form v-if="step === 1" @submit.prevent="handleRequestOtp" class="space-y-4">
      <div>
        <label class="block mb-2 font-semibold">{{ $t('common.email') }}</label>
        <input v-model="email" type="email" class="input" required :disabled="loading" />
      </div>

      <!-- hCaptcha Widget -->
      <div class="captcha-wrapper">
        <VueHcaptcha :sitekey="hcaptchaSiteKey" @verify="onCaptchaVerify" @error="onCaptchaError"
          @expired="onCaptchaExpired" />
      </div>

      <button type="submit" class="btn w-full" :disabled="loading || !captchaToken">
        <span v-if="loading">{{ $t('common.loading') }}...</span>
        <span v-else>{{ $t('signup.requestOtp') }}</span>
      </button>

      <p v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</p>
    </form>

    <!-- Step 2: Verify OTP -->
    <form v-else-if="step === 2" @submit.prevent="handleVerifyOtp" class="space-y-4">
      <div>
        <label class="block mb-2 font-semibold">{{ $t('signup.otpLabel') }}</label>
        <input v-model="otp" type="text" class="input" required :disabled="loading" placeholder="123456" />
      </div>

      <button type="submit" class="btn w-full" :disabled="loading">
        <span v-if="loading">{{ $t('common.loading') }}...</span>
        <span v-else>{{ $t('signup.verifyOtp') }}</span>
      </button>

      <p v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</p>
    </form>

    <!-- Step 3: Complete signup -->
    <form v-else-if="step === 3" @submit.prevent="handleSignup" class="space-y-4">
      <div>
        <label class="block mb-2 font-semibold">{{ $t('common.name') }}</label>
        <input v-model="name" type="text" class="input" required :disabled="loading" />
      </div>

      <div>
        <label class="block mb-2 font-semibold">{{ $t('common.password') }}</label>
        <input v-model="password" type="password" class="input" required minlength="6" :disabled="loading" />
      </div>

      <div>
        <label class="block mb-2 font-semibold">{{ $t('signup.blogName') }}</label>
        <input v-model="blogName" type="text" class="input" required :disabled="loading" />
      </div>

      <div>
        <label class="block mb-2 font-semibold">{{ $t('blogs.subdomain') }}</label>
        <input v-model="subdomain" type="text" class="input" required :disabled="loading" pattern="[a-z0-9-]+"
          placeholder="mi-blog" />
        <p class="text-xs text-gray-500 mt-1">Solo letras minúsculas, números y guiones</p>
      </div>

      <button type="submit" class="btn w-full" :disabled="loading">
        <span v-if="loading">{{ $t('common.loading') }}...</span>
        <span v-else>{{ $t('signup.createAccount') }}</span>
      </button>

      <p v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</p>
    </form>

    <!-- Step 4: Success -->
    <div v-else-if="step === 4" class="text-center py-8">
      <div class="text-green-600 text-5xl mb-4">✓</div>
      <h3 class="text-xl font-bold mb-2">{{ $t('signup.success') }}</h3>
      <p class="text-gray-600 mb-4">Tu cuenta ha sido creada exitosamente</p>
      <router-link to="/login" class="btn inline-block">
        {{ $t('login.login') }}
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import VueHcaptcha from '@hcaptcha/vue3-hcaptcha'

const { t } = useI18n()

// hCaptcha site key - using test key for now (replace with your real key)
const hcaptchaSiteKey = '4e246330-29ba-4fc8-88ac-f1aa46889238'

// Form state
const step = ref(1)
const email = ref('')
const otp = ref('')
const name = ref('')
const password = ref('')
const blogName = ref('')
const subdomain = ref('')
const loading = ref(false)
const error = ref('')
const captchaToken = ref(null)

// Get API endpoint
function getApiEndpoint() {
  if (typeof window === 'undefined') return 'http://localhost:3000/api/'

  const hostname = window.location.hostname
  const isProduction = hostname !== 'localhost' && !hostname.includes('127.0.0.1')

  const apiUrl = isProduction
    ? 'https://taita-api.onrender.com'
    : (import.meta.env.VITE_API_URL || 'http://localhost:3000')

  return `${apiUrl}/api/`
}

// hCaptcha event handlers
function onCaptchaVerify(token) {
  console.log('[hCaptcha] Verified:', token)
  captchaToken.value = token
  error.value = ''
}

function onCaptchaError(err) {
  console.error('[hCaptcha] Error:', err)
  error.value = t('signup.captchaError')
  captchaToken.value = null
}

function onCaptchaExpired() {
  console.log('[hCaptcha] Expired')
  captchaToken.value = null
}

// Handle request OTP
async function handleRequestOtp() {
  if (!captchaToken.value) {
    error.value = t('signup.captchaError')
    return
  }

  loading.value = true
  error.value = ''

  try {
    const apiUrl = getApiEndpoint()
    await axios.post(`${apiUrl}auth/request-otp`, {
      email: email.value,
      captchaToken: captchaToken.value
    })

    step.value = 2
    console.log('[Signup] OTP sent to:', email.value)
  } catch (err) {
    console.error('[Signup] Request OTP error:', err)
    error.value = err.response?.data?.error || t('signup.otpRequestError')
  } finally {
    loading.value = false
  }
}

// Handle verify OTP
async function handleVerifyOtp() {
  loading.value = true
  error.value = ''

  try {
    const apiUrl = getApiEndpoint()
    await axios.post(`${apiUrl}auth/verify-otp`, {
      email: email.value,
      code: otp.value
    })

    step.value = 3
    console.log('[Signup] OTP verified')
  } catch (err) {
    console.error('[Signup] Verify OTP error:', err)
    error.value = err.response?.data?.error || t('signup.otpError')
  } finally {
    loading.value = false
  }
}

// Handle signup
async function handleSignup() {
  loading.value = true
  error.value = ''

  try {
    const apiUrl = getApiEndpoint()
    await axios.post(`${apiUrl}auth/signup`, {
      email: email.value,
      password: password.value,
      name: name.value,
      blogName: blogName.value,
      subdomain: subdomain.value
    })

    step.value = 4
    console.log('[Signup] Account created successfully')
  } catch (err) {
    console.error('[Signup] Signup error:', err)
    error.value = err.response?.data?.error || t('signup.signupError')
  } finally {
    loading.value = false
  }
}

// No lifecycle hooks needed - hCaptcha component handles everything
</script>

<style scoped>
.signup-form-container {
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  max-width: 400px;
  width: 100%;
}

.signup-logo {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.signup-logo img {
  width: 100%;
  max-width: 200px;
  height: auto;
}

.input {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.input:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}

.btn {
  width: 100%;
  background-color: #2563eb;
  color: white;
  font-weight: 600;
  padding: 0.625rem 1rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.btn:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}

.captcha-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
