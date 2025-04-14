<template>
  <div>
    <label :for="id" class="block text-sm font-medium text-gray-700 mb-1">{{ label }}</label>
    <div
      class="flex rounded border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-gray-300 focus-within:border-gray-300"
    >
      <span class="bg-gray-50 px-3 py-2 text-gray-500 text-sm border-r border-gray-300">{{ prefix }}</span>
      <input
        :id="id"
        v-model="localValue"
        :placeholder="placeholder"
        class="flex-1 px-4 py-2 focus:outline-none"
        :disabled="disabled"
        @input="onInput"
        @blur="onBlur"
      >
      <button 
        v-if="!disabled && showRefreshButton" 
        type="button" 
        @click="regenerateSlug"
        class="px-3 text-gray-500 hover:text-gray-700 focus:outline-none"
        title="Regenerar slug"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
    <div v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</div>
    <div v-else-if="hint" class="mt-1 text-xs text-gray-500">{{ hint }}</div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { slugify, generateUniqueSlug } from '@/utils/slugify';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  sourceText: {
    type: String,
    default: ''
  },
  prefix: {
    type: String,
    default: '/'
  },
  label: {
    type: String,
    default: 'Slug'
  },
  placeholder: {
    type: String,
    default: 'mi-slug-personalizado'
  },
  id: {
    type: String,
    default: 'slug-field'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  hint: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: ''
  },
  showRefreshButton: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:modelValue', 'check-availability']);

const localValue = ref(props.modelValue);
const userModified = ref(false);

// Actualizar el valor local cuando cambia el modelValue
watch(() => props.modelValue, (newValue) => {
  if (newValue !== localValue.value) {
    localValue.value = newValue;
  }
});

// Generar slug automáticamente cuando cambia el texto fuente
// pero solo si el usuario no ha modificado manualmente el slug
watch(() => props.sourceText, (newValue) => {
  if (!userModified.value && newValue) {
    const newSlug = slugify(newValue);
    if (newSlug && newSlug !== localValue.value) {
      localValue.value = newSlug;
      emit('update:modelValue', newSlug);
      emit('check-availability', newSlug);
    }
  }
});

// Emitir eventos cuando cambia el valor local
function onInput() {
  userModified.value = true;
  emit('update:modelValue', localValue.value);
}

// Verificar disponibilidad al perder el foco
function onBlur() {
  if (localValue.value) {
    emit('check-availability', localValue.value);
  }
}

// Regenerar slug a partir del texto fuente
function regenerateSlug() {
  if (props.sourceText) {
    const newSlug = generateUniqueSlug(props.sourceText, true);
    localValue.value = newSlug;
    userModified.value = false;
    emit('update:modelValue', newSlug);
    emit('check-availability', newSlug);
  }
}

onMounted(() => {
  // Si no hay valor inicial pero hay texto fuente, generar slug automáticamente
  if (!props.modelValue && props.sourceText) {
    const newSlug = slugify(props.sourceText);
    if (newSlug) {
      localValue.value = newSlug;
      emit('update:modelValue', newSlug);
      emit('check-availability', newSlug);
    }
  }
});
</script>
