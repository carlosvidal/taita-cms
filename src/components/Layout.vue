<template>
  <div :class="[colors.light.bg, 'min-h-screen']">
    <div class="container mx-auto px-4">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { colors } from '@/styles/designSystem'
</script>