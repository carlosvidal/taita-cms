<template>
  <div class="overflow-x-auto bg-panel sm:rounded-lg sm:border sm:border-panel">
    <table class="min-w-full divide-y border-panel">
      <thead class="bg-panel">
        <tr>
          <slot name="header" />
        </tr>
      </thead>
      <tbody class="bg-panel divide-y border-panel">
        <slot name="body" />
        <tr v-if="empty && $slots.empty">
          <td :colspan="colSpan" class="px-6 py-10 text-center text-gray-500">
            <slot name="empty" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  empty: {
    type: Boolean,
    default: false
  },
  colSpan: {
    type: Number,
    default: 1
  }
})
</script>

<style scoped>
:deep(th) {
  @apply px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider;
}

:deep(td) {
  @apply px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-700;
}

:deep(tbody tr) {
  @apply transition-colors duration-150;
}
:deep(tbody tr):hover {
  background: var(--color-panel) !important;
}
</style>