<template>
  <button
    @click="toggleColorMode"
    class="group relative p-2 rounded-lg transition-all duration-200 ease-in-out
           bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700
           border border-gray-200 dark:border-gray-700
           focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
           focus:ring-offset-2 dark:focus:ring-offset-gray-900"
    :title="isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
    :aria-label="isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
  >
    <!-- Sun icon for light mode -->
    <svg
      v-if="isDark"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      class="w-5 h-5 text-gray-600 dark:text-gray-300 transition-transform duration-200 group-hover:scale-110"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
      />
    </svg>

    <!-- Moon icon for dark mode -->
    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      class="w-5 h-5 text-gray-600 dark:text-gray-300 transition-transform duration-200 group-hover:scale-110"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
      />
    </svg>

    <!-- Loading animation during transition -->
    <div
      v-if="isTransitioning"
      class="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg"
    >
      <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 dark:border-gray-300"></div>
    </div>
  </button>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const isTransitioning = ref(false)
const isDark = ref(false)

// Check if we're in a dark mode environment
const checkDarkMode = () => {
  if (typeof window !== 'undefined') {
    // Check localStorage first
    const saved = localStorage.getItem('taita-color-mode')
    if (saved) {
      return saved === 'dark'
    }
    
    // Check system preference
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  return false
}

// Apply dark mode to document
const applyDarkMode = (dark) => {
  if (typeof document !== 'undefined') {
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
}

// Toggle color mode function
const toggleColorMode = async () => {
  isTransitioning.value = true
  
  // Add a small delay to show the transition animation
  await new Promise(resolve => setTimeout(resolve, 100))
  
  isDark.value = !isDark.value
  
  // Apply to document
  applyDarkMode(isDark.value)
  
  // Save to localStorage
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('taita-color-mode', isDark.value ? 'dark' : 'light')
  }
  
  // Wait for the transition to complete
  await new Promise(resolve => setTimeout(resolve, 200))
  
  isTransitioning.value = false
}

// Initialize on mount
onMounted(() => {
  isDark.value = checkDarkMode()
  applyDarkMode(isDark.value)
  
  // Listen for system theme changes
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => {
      // Only update if no manual preference is set
      const saved = localStorage.getItem('taita-color-mode')
      if (!saved) {
        isDark.value = e.matches
        applyDarkMode(isDark.value)
      }
    }
    
    mediaQuery.addEventListener('change', handleChange)
    
    // Cleanup listener on unmount
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }
})
</script>

<style scoped>
/* Additional custom styling if needed */
.group:hover svg {
  transform: scale(1.1);
}

/* Smooth transition for icon changes */
svg {
  transition: all 0.2s ease-in-out;
}
</style>