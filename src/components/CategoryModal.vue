<script setup>
import { ref, watch, onMounted } from 'vue'
import BaseButton from './BaseButton.vue'
import { transitions, rounded, shadows } from '@/styles/designSystem'
import { X, Save } from 'lucide-vue-next'

const props = defineProps({
  category: {
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
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const handleNameChange = () => {
  if (!formData.value.slug || formData.value.slug === '') {
    formData.value.slug = generateSlug(formData.value.name)
  }
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

watch(() => props.category, (newCategory) => {
  if (newCategory) {
    formData.value = { ...newCategory }
  } else {
    formData.value = { id: null, name: '', slug: '' }
  }
}, { immediate: true })

onMounted(() => {
  // Focus on name input when modal opens
  setTimeout(() => {
    document.getElementById('category-name-input')?.focus()
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
            {{ category ? 'Editar' : 'Nueva' }} categoría
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
            <label for="category-name-input" class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input 
              id="category-name-input"
              v-model="formData.name" 
              @input="handleNameChange"
              required
              placeholder="Nombre de la categoría"
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
                v-model="formData.slug" 
                required
                placeholder="categoria-url"
                class="flex-1 px-4 py-2 focus:outline-none"
              >
            </div>
            <p class="mt-1 text-xs text-gray-500">Este será el URL de la categoría en tu blog</p>
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