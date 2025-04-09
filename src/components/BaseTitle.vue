<template>
  <component 
    :is="`h${level}`" 
    :class="[
      level === 1 ? 'text-3xl font-bold text-gray-900' : 
      level === 2 ? 'text-2xl font-semibold text-gray-800' : 
      level === 3 ? 'text-xl font-medium text-gray-800' : 
      'text-lg font-medium text-gray-700',
      'mb-4',
      className
    ]">
    <slot />
  </component>
</template>

<script setup>
defineProps({
  level: {
    type: Number,
    default: 1,
    validator: (value) => [1, 2, 3, 4].includes(value)
  },
  className: {
    type: String,
    default: ''
  }
})
</script>