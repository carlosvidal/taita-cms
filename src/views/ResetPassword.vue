<!-- src/views/ResetPassword.vue -->
<template>
    <div class="reset-container">
        <form @submit.prevent="submit">
            <div class="reset-logo">
                <img src="@/assets/taita-logo.svg" alt="Taita" />
            </div>
            <h2>Elige una nueva contraseña</h2>
            <input v-model="password" type="password" placeholder="Nueva contraseña" required minlength="6" />
            <button type="submit" :disabled="loading">Cambiar contraseña</button>
            <p v-if="message">{{ message }}</p>
        </form>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const password = ref('')
const message = ref('')
const loading = ref(false)
const route = useRoute()
const token = route.query.token

async function submit() {
    loading.value = true
    message.value = ''
    try {
        await axios.post('/api/password/reset', { token, password: password.value })
        message.value = "¡Contraseña actualizada! Ya puedes iniciar sesión."
    } catch (e) {
        message.value = "El enlace es inválido o expiró."
    }
    loading.value = false
}
</script>

<style scoped>
.reset-logo {
    display: flex;
    justify-content: center;
    margin-bottom: 1.5rem;
}

.reset-logo img {
    width: 100%;
    max-width: 200px;
    height: auto;
}
</style>