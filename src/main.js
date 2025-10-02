import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { setupResponseInterceptors, api } from './utils/api'
import i18n from './plugins/i18n'

// Hacer que la instancia de api esté disponible globalmente
window.api = api;

const app = createApp(App)

// Configurar interceptores de la API
setupResponseInterceptors(router)

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')
