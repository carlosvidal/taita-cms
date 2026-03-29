<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <h2>{{ isEditMode ? 'Editar blog' : 'Crear nuevo blog' }}</h2>
      <form @submit.prevent="handleSubmit">
        <input v-model="form.name" placeholder="Nombre del blog" required @input="onNameInput" />
        <div class="subdomain-field">
          <input v-model="form.subdomain" placeholder="Subdominio" required @input="subdomainManuallyEdited = true; checkSubdomainAvailability()" />
          <span v-if="checkingSubdomain" class="subdomain-status checking">verificando...</span>
          <span v-else-if="form.subdomain && subdomainAvailable === true" class="subdomain-status available">✓ disponible</span>
          <span v-else-if="form.subdomain && subdomainAvailable === false" class="subdomain-status unavailable">✗ no disponible</span>
        </div>
        <input v-model="form.domain" placeholder="Dominio personalizado (opcional)" />
        <p class="domain-note">* Los dominios personalizados están disponibles temporalmente para todos los planes</p>
        <select v-model="form.plan">
          <option value="FREE">Free</option>
          <option value="PRO">Pro</option>
        </select>
        <div class="modal-actions">
          <button type="submit">{{ isEditMode ? 'Actualizar' : 'Crear' }}</button>
          <button type="button" @click="$emit('close')">Cancelar</button>
        </div>
        <div v-if="error" class="error">{{ error }}</div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import api from '@/utils/api'

const props = defineProps({ blog: Object })
const isEditMode = computed(() => !!(props.blog && (props.blog.id || props.blog.uuid)))
const emit = defineEmits(['save', 'close'])

const form = ref({
  name: '',
  subdomain: '',
  domain: '',
  plan: 'FREE',
})
const error = ref('')
const subdomainManuallyEdited = ref(false)
const subdomainAvailable = ref(null)
const checkingSubdomain = ref(false)
let checkTimeout = null

watch(() => props.blog, (blog) => {
  if (blog) {
    form.value = { ...blog }
    subdomainManuallyEdited.value = true
  } else {
    form.value = { name: '', subdomain: '', domain: '', plan: 'FREE' }
    subdomainManuallyEdited.value = false
  }
  subdomainAvailable.value = null
}, { immediate: true })

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function onNameInput() {
  if (!isEditMode.value && !subdomainManuallyEdited.value) {
    form.value.subdomain = slugify(form.value.name)
    checkSubdomainAvailability()
  }
}

function checkSubdomainAvailability() {
  clearTimeout(checkTimeout)
  subdomainAvailable.value = null

  if (!form.value.subdomain) {
    checkingSubdomain.value = false
    return
  }

  checkingSubdomain.value = true
  checkTimeout = setTimeout(async () => {
    try {
      const { data } = await api.get(`/api/auth/check-subdomain/${form.value.subdomain}`)
      subdomainAvailable.value = data.available
    } catch {
      subdomainAvailable.value = null
    } finally {
      checkingSubdomain.value = false
    }
  }, 400)
}

function handleSubmit() {
  error.value = ''
  if (!form.value.name || !form.value.subdomain) {
    error.value = 'Nombre y subdominio son requeridos'
    return
  }
  if (subdomainAvailable.value === false) {
    error.value = 'El subdominio no está disponible'
    return
  }
  emit('save', { ...form.value, id: props.blog?.id, uuid: props.blog?.uuid })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal {
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  min-width: 320px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.13);
}
.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}
.modal input, .modal select {
  display: block;
  width: 100%;
  margin-bottom: 1rem;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.error {
  color: #c00;
  margin-top: 0.5rem;
}

.subdomain-field {
  position: relative;
}
.subdomain-status {
  font-size: 0.75rem;
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-75%);
}
.subdomain-status.checking { color: #888; }
.subdomain-status.available { color: #16a34a; }
.subdomain-status.unavailable { color: #dc2626; }

.domain-note {
  font-size: 0.8rem;
  color: #4f46e5;
  margin-top: -0.5rem;
  margin-bottom: 1rem;
  font-style: italic;
}
</style>
