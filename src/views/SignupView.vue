<template>
  <div class="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-100">
    <SignupForm />
  </div>
</template>

<script setup>
import SignupForm from '@/components/SignupForm.vue'
</script>

<style scoped>
.input {
  @apply border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500;
}

.btn {
  @apply bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 transition;
}
</style>
