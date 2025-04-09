<template>
  <div class="overflow-x-auto bg-white sm:rounded-lg sm:border sm:border-gray-200">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <slot name="header" />
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
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
  @apply hover:bg-gray-50 transition-colors duration-150;
}
</style>