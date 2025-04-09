<template>
  <button
    :class="[
      'px-4 py-2 font-medium inline-flex items-center justify-center gap-2 transition-all duration-200',
      'rounded whitespace-nowrap',
      getVariantClasses,
      size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-base px-5 py-2.5' : 'text-sm',
      fullWidth ? 'w-full' : '',
      disabled ? 'opacity-50 cursor-not-allowed' : '',
      className
    ]"
    :disabled="disabled"
    v-bind="$attrs"
  >
    <span v-if="$slots.icon" class="icon">
      <slot name="icon" />
    </span>
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { rounded } from '@/styles/designSystem'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'tertiary', 'danger', 'ghost', 'outline'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  fullWidth: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  className: {
    type: String,
    default: ''
  }
})

const getVariantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'bg-gray-800 text-white hover:bg-gray-900 focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 shadow-sm'
    case 'secondary':
      return 'bg-gray-200 text-gray-800 border border-gray-300 hover:bg-gray-300 focus:ring-2 focus:ring-gray-300 shadow-sm'
    case 'tertiary':
      return 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-2 focus:ring-gray-200'
    case 'danger':
      return 'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-sm'
    case 'ghost':
      return 'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-2 focus:ring-gray-200'
    default:
      return 'bg-gray-800 text-white hover:bg-gray-900 focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 shadow-sm'
  }
})
</script>