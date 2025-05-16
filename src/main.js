import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { setupResponseInterceptors, api } from './utils/api'

// Hacer que la instancia de api esté disponible globalmente
window.api = api;

const app = createApp(App)

// Configurar interceptores de la API
setupResponseInterceptors(router)

app.use(createPinia())
app.use(router)

app.mount('#app')
