<!-- src/views/ForgotPassword.vue -->
<template>
    <div class="forgot-container">
        <form @submit.prevent="submit">
            <h2>Recuperar contraseña</h2>
            <input v-model="email" type="email" placeholder="Tu email" required />
            <button type="submit" :disabled="loading">Enviar enlace</button>
            <p v-if="message">{{ message }}</p>
        </form>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const email = ref('')
const message = ref('')
const loading = ref(false)

async function submit() {
    loading.value = true
    message.value = ''
    try {
        await axios.post('/api/password/forgot', { email: email.value })
        message.value = "Si el email existe, recibirás un enlace para restablecer tu contraseña."
    } catch (e) {
        message.value = "Ocurrió un error. Intenta de nuevo."
    }
    loading.value = false
}
</script>