<template>
  <div class="flex items-center p-5 bg-white rounded-lg border border-gray-200 transition-all duration-200 hover:shadow-sm">
    <div :class="`w-10 h-10 rounded flex items-center justify-center mr-4 ${getIconBgColor}`">
      <component :is="getIconComponent" class="w-5 h-5 text-white" />
    </div>
    <div>
      <h3 class="text-gray-500 text-sm font-medium mb-1">{{ title }}</h3>
      <p class="text-2xl font-bold text-gray-900">{{ value }}</p>
      <div v-if="$slots.footer" class="mt-1 text-xs text-gray-500">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { FileText, File, Tag } from 'lucide-vue-next'

const props = defineProps({
  title: String,
  value: [String, Number],
  icon: String,
  color: {
    type: String,
    default: 'blue',
    validator: (value) => ['blue', 'green', 'purple', 'orange', 'red', 'gray'].includes(value)
  }
})

const getIconBgColor = computed(() => {
  // Cambiar todos los colores a gris para un diseño más sobrio y consistente
  return 'bg-gray-800'
})

const getIconComponent = computed(() => {
  const iconMap = {
    'article': FileText,
    'description': File,
    'category': Tag
  }
  
  return iconMap[props.icon] || FileText
})
</script>