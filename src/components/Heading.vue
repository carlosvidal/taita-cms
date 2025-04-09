<template>
  <component 
    :is="`h${level}`" 
    :class="[
      typography[`h${level}`], 
      ...customClasses,
      className,
      noMargin ? '' : 'mb-4'
    ]">
    <slot />
  </component>
</template>

<script setup>
import { typography, transitions } from '@/styles/designSystem'

defineProps({
  level: {
    type: Number,
    default: 1,
    validator: (value) => [1, 2, 3, 4].includes(value)
  },
  customClasses: {
    type: Array,
    default: () => []
  },
  className: {
    type: String,
    default: ''
  },
  noMargin: {
    type: Boolean,
    default: false
  }
})
</script>