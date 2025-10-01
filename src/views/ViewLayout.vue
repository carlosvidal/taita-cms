<template>
  <div :class="['min-h-screen', colors.light.bg, transitions.default]">
    <div class="max-w-5xl mx-auto px-3 py-4 sm:px-6 sm:py-8">
      <div class="mb-6" v-if="$slots.title">
        <BaseTitle :level="1" :className="colors.light.text">
          <slot name="title" />
        </BaseTitle>
        <div v-if="$slots.subtitle" class="mt-2 text-gray-500">
          <slot name="subtitle" />
        </div>
      </div>

      <div :class="[
        'w-full',
        'p-3 sm:p-6',
        'sm:rounded',
        'sm:border',
        'sm:shadow-md',
        colors.light.card,
        colors.light.text,
        colors.light.border
      ]">
        <slot />
      </div>

      <div v-if="$slots.footer" class="mt-6 text-sm text-gray-500">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script setup>
import BaseTitle from '@/components/BaseTitle.vue'
import { colors, shadows, rounded, transitions } from '@/styles/designSystem'
</script>