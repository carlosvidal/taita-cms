<script setup>
import { ref, watch, onMounted } from 'vue'
import BaseButton from './BaseButton.vue'
import { transitions, rounded, shadows } from '@/styles/designSystem'
import { X, Save } from 'lucide-vue-next'

const props = defineProps({
  tag: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['save', 'close'])

const formData = ref({
  id: null,
  name: '',
  slug: ''
})

const isSaving = ref(false)
const error = ref('')

const generateSlug = (name) => {
  if (!name) return '';
  return name
    .toString()
    .toLowerCase()
    .normalize('NFD') // Normaliza caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Elimina los acentos
    .replace(/[^a-z0-9]+/g, '-') // Reemplaza caracteres no alfanuméricos por guiones
    .replace(/(^-+|-+$)/g, '') // Elimina guiones al inicio y final
    .substring(0, 50); // Limita la longitud del slug
}

const handleNameChange = () => {
  // Solo generar automáticamente el slug si el campo de slug está vacío
  // o si el usuario no lo ha modificado manualmente
  if (!formData.value.slug || formData.value.slug === '') {
    formData.value.slug = generateSlug(formData.value.name);
  }
}

const handleSlugInput = (event) => {
  // Aplicar formato al slug mientras el usuario escribe
  formData.value.slug = generateSlug(event.target.value);
}

const handleSubmit = () => {
  isSaving.value = true
  error.value = ''

  try {
    // Validate
    if (!formData.value.name) {
      throw new Error('El nombre es obligatorio')
    }

    if (!formData.value.slug) {
      throw new Error('El slug es obligatorio')
    }

    emit('save', formData.value)
  } catch (err) {
    error.value = err.message
    isSaving.value = false
  }
}

watch(() => props.tag, (newTag) => {
  if (newTag) {
    formData.value = { ...newTag }
  } else {
    formData.value = { id: null, name: '', slug: '' }
  }
}, { immediate: true })

onMounted(() => {
  // Focus on name input when modal opens
  setTimeout(() => {
    document.getElementById('tag-name-input')?.focus()
  }, 100)
})
</script>

<template>
  <div class="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div
      :class="[
        'bg-white w-full max-w-md',
        rounded.lg,
        shadows.xl,
        'transform transition-all duration-300 ease-in-out'
      ]"
      @click.stop
    >
      <div class="p-6 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-bold text-gray-900">
            {{ tag ? 'Editar' : 'Nuevo' }} tag
          </h2>
          <button
            @click="$emit('close')"
            class="p-1 rounded hover:bg-gray-100 text-gray-500 transition-colors"
            title="Cerrar"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
      </div>

      <div class="p-6">
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Error message -->
          <div v-if="error" class="p-3 bg-red-50 rounded-md border border-red-200 text-red-600 text-sm">
            {{ error }}
          </div>

          <!-- Name input -->
          <div>
            <label for="tag-name-input" class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              id="tag-name-input"
              v-model="formData.name"
              @input="handleNameChange"
              required
              placeholder="Nombre del tag"
              :class="[
                'w-full px-4 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:border-gray-500',
                transitions.default
              ]"
            >
          </div>

          <!-- Slug input -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <div class="flex rounded border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-gray-500 focus-within:border-gray-500">
              <span class="bg-gray-50 px-3 py-2 text-gray-500 text-sm border-r border-gray-300">/</span>
              <input
                :value="formData.slug"
                @input="handleSlugInput"
                required
                placeholder="tag-url"
                class="flex-1 px-4 py-2 focus:outline-none"
                @blur="formData.slug = generateSlug(formData.slug)"
              >
            </div>
            <p class="mt-1 text-xs text-gray-500">Este será el URL del tag en tu blog</p>
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <BaseButton
              type="button"
              variant="secondary"
              @click="$emit('close')"
              :disabled="isSaving"
            >
              Cancelar
            </BaseButton>
            <BaseButton
              type="submit"
              variant="primary"
              :disabled="isSaving"
            >
              <div v-if="isSaving">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </div>
              <div v-else>
                <Save class="w-4 h-4 mr-2" />
                Guardar
              </div>
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
