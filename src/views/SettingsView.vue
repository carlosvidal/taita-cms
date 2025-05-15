<template>
  <ViewLayout>
    <template #title>Configuración</template>
    <template #subtitle>Personaliza las configuraciones de tu blog</template>

    <div class="space-y-6">
      <div v-if="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
        {{ errorMessage }}
      </div>
      <div v-if="isLoading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>

      <form v-else @submit.prevent="saveSettings" class="space-y-6">
        <!-- Título del Blog -->
        <div class="space-y-2">
          <label for="title" class="block text-sm font-medium text-gray-700">Título del Blog</label>
          <input type="text" id="title" v-model="settings.title" placeholder="Mi Blog"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
          <p class="text-xs text-gray-500 mt-1">El título principal de tu blog</p>
        </div>

        <!-- Descripción del Blog -->
        <div class="space-y-2">
          <label for="description" class="block text-sm font-medium text-gray-700">Descripción del Blog</label>
          <textarea id="description" v-model="settings.description" placeholder="Una breve descripción de tu blog"
            rows="3"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
          <p class="text-xs text-gray-500 mt-1">Una breve descripción que aparecerá en la página principal</p>
        </div>

        <!-- Idioma -->
        <div class="space-y-2">
          <label for="language" class="block text-sm font-medium text-gray-700">Idioma</label>
          <select id="language" v-model="settings.language"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            <option value="es">Español</option>
            <option value="en">English</option>
            <option value="fr">Français</option>
          </select>
        </div>

        <!-- Plantilla -->
        <div class="space-y-2">
          <label for="template" class="block text-sm font-medium text-gray-700">Plantilla</label>
          <select id="template" v-model="settings.template"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            <option value="default">Default</option>
            <option value="minimal">Minimal</option>
            <option value="professional">Professional</option>
          </select>
        </div>

        <!-- Dominio -->
        <div class="space-y-2">
          <label for="domain" class="block text-sm font-medium text-gray-700">Dominio</label>
          <input type="text" id="domain" v-model="settings.domain" placeholder="ejemplo.com"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            :disabled="!isProPlan" />
          <p class="text-xs text-gray-500 mt-1">El dominio principal de tu blog</p>
          <div v-if="!isProPlan" class="mt-1">
            <button type="button" @click="showSubscriptionSection = true"
              class="text-blue-600 underline text-xs font-medium hover:text-blue-800">Mejorar plan</button>
            <span class="text-xs text-gray-400 ml-2">(Solo disponible en PRO)</span>
          </div>
        </div>

        <!-- Google Analytics ID -->
        <div class="space-y-2">
          <label for="googleAnalyticsId" class="block text-sm font-medium text-gray-700">Google Analytics ID</label>
          <input type="text" id="googleAnalyticsId" v-model="settings.googleAnalyticsId"
            placeholder="UA-XXXXXXXXX-X o G-XXXXXXXXXX"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            :disabled="!isProPlan" />
          <p class="text-xs text-gray-500 mt-1">Tu ID de Google Analytics para rastrear visitas</p>
          <div v-if="!isProPlan" class="mt-1">
            <button type="button" @click="showSubscriptionSection = true"
              class="text-blue-600 underline text-xs font-medium hover:text-blue-800">Mejorar plan</button>
            <span class="text-xs text-gray-400 ml-2">(Solo disponible en PRO)</span>
          </div>
        </div>

        <!-- Redes Sociales -->
        <div class="space-y-2">
          <h3 class="text-sm font-medium text-gray-700 mb-2">Redes Sociales</h3>

          <div class="space-y-4">
            <div class="flex items-center space-x-4">
              <div class="w-24">
                <label for="twitter" class="block text-sm text-gray-600">Twitter</label>
              </div>
              <input type="text" id="twitter" v-model="socialNetworks.twitter" placeholder="@usuario"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>

            <div class="flex items-center space-x-4">
              <div class="w-24">
                <label for="facebook" class="block text-sm text-gray-600">Facebook</label>
              </div>
              <input type="text" id="facebook" v-model="socialNetworks.facebook" placeholder="facebook.com/pagina"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>

            <div class="flex items-center space-x-4">
              <div class="w-24">
                <label for="instagram" class="block text-sm text-gray-600">Instagram</label>
              </div>
              <input type="text" id="instagram" v-model="socialNetworks.instagram" placeholder="@usuario"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button type="button" @click="resetForm"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Cancelar
          </button>
          <button type="submit" :disabled="isSaving"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
            <span v-if="isSaving">Guardando...</span>
            <span v-else>Guardar Cambios</span>
          </button>
        </div>
      </form>

      <!-- Sección de Suscripción -->
      <div v-if="showSubscriptionSection" class="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-medium text-gray-900">Tu plan actual</h2>
          <button @click="showSubscriptionSection = false" class="text-gray-400 hover:text-gray-500">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="mb-6 p-4 bg-white rounded-md shadow-sm">
          <p class="font-medium">Plan: {{ currentPlan }}</p>
          <p class="text-sm text-gray-600">Estado: {{ subscriptionStatus }}</p>
          <p v-if="nextPaymentDate" class="text-sm text-gray-600">Próximo pago: {{ nextPaymentDate }}</p>
        </div>

        <div class="mb-4">
          <h3 class="text-md font-medium mb-3">Actualizar a Plan Pro</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
              <h4 class="font-medium mb-2">Mensual</h4>
              <p class="text-lg font-bold mb-2">$9.99/mes</p>
              <button @click="upgradePlan('monthly')"
                class="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Actualizar
              </button>
            </div>
            <div class="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
              <h4 class="font-medium mb-2">Anual</h4>
              <p class="text-lg font-bold mb-2">$99.99/año</p>
              <button @click="upgradePlan('yearly')"
                class="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Actualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Mensaje de éxito -->
      <div v-if="showSuccess"
        class="fixed bottom-4 right-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md shadow-md">
        <div class="flex items-center">
          <svg class="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>Configuración guardada correctamente</span>
        </div>
      </div>
    </div>
  </ViewLayout>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import ViewLayout from '@/views/ViewLayout.vue'
import api from '@/utils/api'
import { useRouter } from 'vue-router'

// Estado
const isLoading = ref(true)
const isSaving = ref(false)
const showSuccess = ref(false)
const originalSettings = ref({})
const showSubscriptionSection = ref(false)
const router = useRouter()

// Estado de suscripción
const currentPlan = ref('Free')
const subscriptionStatus = ref('Inactivo')
const nextPaymentDate = ref(null)

// Obtener plan del blog activo desde localStorage
const activeBlog = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('activeBlog')) || {};
  } catch {
    return {};
  }
});
const plan = computed(() => activeBlog.value.plan || 'FREE');
const isProPlan = computed(() => plan.value === 'PRO');

// Configuraciones
const settings = reactive({
  title: 'Mi Blog',
  description: 'Un blog personal',
  language: 'es',
  template: 'default',
  domain: '',
  googleAnalyticsId: '',
  socialNetworks: {}
})

// Redes sociales (se guardarán como JSON en el campo socialNetworks)
const socialNetworks = reactive({
  twitter: '',
  facebook: '',
  instagram: ''
})

// Cargar configuraciones
const errorMessage = ref('')
const fetchSettings = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const response = await api.get('/api/settings')
    const data = response.data || {}

    // Actualizar configuraciones
    settings.title = data.title || 'Mi Blog'
    settings.description = data.description || 'Un blog personal'
    settings.language = data.language || 'es'
    settings.template = data.template || 'default'
    settings.domain = data.domain || ''
    settings.googleAnalyticsId = data.googleAnalyticsId || ''

    // Parsear redes sociales si existen
    if (data.socialNetworks) {
      try {
        const socialData = typeof data.socialNetworks === 'string'
          ? JSON.parse(data.socialNetworks)
          : data.socialNetworks

        socialNetworks.twitter = socialData.twitter || ''
        socialNetworks.facebook = socialData.facebook || ''
        socialNetworks.instagram = socialData.instagram || ''
      } catch (e) {
        console.error('Error parsing social networks:', e)
      }
    }

    // Guardar configuraciones originales para poder resetear el formulario
    originalSettings.value = {
      ...settings,
      socialNetworks: { ...socialNetworks }
    }

    console.log('Configuraciones cargadas:', settings)
  } catch (error) {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      window.location.href = '/login'
    } else {
      errorMessage.value = 'No se pudieron cargar las configuraciones. Intenta de nuevo o contacta al administrador.'
      console.error('Error al cargar configuraciones:', error)
    }
  } finally {
    isLoading.value = false
  }
}

// Guardar configuraciones
const saveSettings = async () => {
  isSaving.value = true
  try {
    // Preparar datos para enviar
    const dataToSend = {
      ...settings,
      socialNetworks: JSON.stringify(socialNetworks)
    }

    // Enviar al servidor
    await api.put('/api/settings', dataToSend) // Volver a usar PUT para coincidir con la API

    // Mostrar mensaje de éxito
    showSuccess.value = true
    setTimeout(() => {
      showSuccess.value = false
    }, 3000)

    console.log('Configuraciones guardadas correctamente')
  } catch (error) {
    console.error('Error al guardar configuraciones:', error)
    alert('Error al guardar configuraciones. Por favor, inténtalo de nuevo.')
  } finally {
    isSaving.value = false
  }
}

// Resetear formulario
const resetForm = () => {
  if (originalSettings.value) {
    // Restaurar valores originales
    Object.assign(settings, originalSettings.value)
    Object.assign(socialNetworks, originalSettings.value.socialNetworks)
  }
}

// Actualizar plan
const upgradePlan = async (interval) => {
  try {
    const response = await api.post('/api/subscriptions/create-preference', {
      interval: interval,
      plan: 'PRO'
    });

    const { payment_url } = response.data;
    if (payment_url) {
      window.location.href = payment_url;
    } else {
      alert('No se pudo generar el enlace de pago. Intenta de nuevo o contacta soporte.');
      console.error('payment_url inválido:', response.data);
    }
  } catch (error) {
    console.error('Error al actualizar el plan:', error);
  }
};

// Obtener estado de suscripción
const fetchSubscriptionStatus = async () => {
  try {
    const response = await api.get('/api/subscriptions/status');
    const data = response.data;
    currentPlan.value = data.plan || 'Free';
    subscriptionStatus.value = data.status || 'Inactivo';
    nextPaymentDate.value = data.next_payment_date || null;
  } catch (error) {
    console.error('Error al obtener el estado de la suscripción:', error);
  }
};

// Cargar configuraciones y estado de suscripción al montar el componente
onMounted(() => {
  fetchSettings()
  fetchSubscriptionStatus()
})
</script>

<style scoped>
/* Estilos para la sección de suscripción */
.subscription-section {
  margin-top: 2rem;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
}

.current-plan {
  margin-bottom: 1.5rem;
}

.plan-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.plan-option {
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  text-align: center;
}

.price {
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0.5rem 0;
}

.upgrade-btn {
  width: 100%;
  padding: 0.5rem;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
}

.upgrade-btn:hover {
  background-color: #1d4ed8;
}
</style>
