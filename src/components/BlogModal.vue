<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <h2>{{ isEditMode ? 'Editar blog' : 'Crear nuevo blog' }}</h2>
      <form @submit.prevent="handleSubmit">
        <input v-model="form.name" placeholder="Nombre del blog" required />
        <input v-model="form.subdomain" placeholder="Subdominio" required />
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

watch(() => props.blog, (blog) => {
  if (blog) {
    form.value = { ...blog }
  } else {
    form.value = { name: '', subdomain: '', domain: '', plan: 'FREE' }
  }
}, { immediate: true })

function handleSubmit() {
  error.value = ''
  if (!form.value.name || !form.value.subdomain) {
    error.value = 'Nombre y subdominio son requeridos'
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

.domain-note {
  font-size: 0.8rem;
  color: #4f46e5;
  margin-top: -0.5rem;
  margin-bottom: 1rem;
  font-style: italic;
}
</style>
