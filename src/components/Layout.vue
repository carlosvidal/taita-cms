<template>
  <div :class="[darkMode ? colors.dark.bg : colors.light.bg, 'min-h-screen']">
    <div class="container mx-auto px-4">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { colors } from '@/styles/designSystem'

const darkMode = ref(false)
</script>