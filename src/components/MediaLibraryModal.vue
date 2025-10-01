<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { X, Upload, Search, ImageIcon } from 'lucide-vue-next'
import api from '@/utils/api'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  selectedImage: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'select', 'upload'])

const media = ref([])
const loading = ref(false)
const page = ref(1)
const hasMore = ref(true)
const searchQuery = ref('')
const selectedMedia = ref(props.selectedImage)
const isLoadingMore = ref(false)

const apiBaseUrl = computed(() => {
  return api.baseURL || 'http://localhost:3000'
})

const getFullImageUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  return `${apiBaseUrl.value}${path.startsWith('/') ? '' : '/'}${path}`
}

const getVariantUrl = (mediaItem, variant = 'small') => {
  if (!mediaItem) return ''

  // Si tiene cloudinaryUrl, usarla
  if (mediaItem.cloudinaryUrl) {
    return mediaItem.cloudinaryUrl
  }

  // Si tiene variants, intentar obtener la variante
  if (mediaItem.variants) {
    let variants = mediaItem.variants
    if (typeof variants === 'string') {
      try {
        variants = JSON.parse(variants)
      } catch (e) {
        console.error('Error parsing variants:', e)
      }
    }

    if (variants && variants[variant]) {
      return getFullImageUrl(variants[variant])
    }
  }

  // Fallback a la URL principal
  return getFullImageUrl(mediaItem.url || mediaItem.path)
}

const fetchMedia = async (reset = false) => {
  if (loading.value || (!reset && !hasMore.value)) return

  try {
    if (reset) {
      loading.value = true
      page.value = 1
      media.value = []
    } else {
      isLoadingMore.value = true
    }

    const response = await api.get('/api/media', {
      params: {
        page: page.value,
        limit: 24
      }
    })

    console.log('Media response:', response.data)

    if (response.data.success && response.data.data) {
      const newMedia = response.data.data

      if (reset) {
        media.value = newMedia
      } else {
        media.value = [...media.value, ...newMedia]
      }

      // Verificar si hay más páginas
      const pagination = response.data.pagination
      if (pagination) {
        hasMore.value = pagination.page < pagination.pages
      } else {
        hasMore.value = newMedia.length === 24
      }

      page.value++
    }
  } catch (error) {
    console.error('Error al cargar medios:', error)
  } finally {
    loading.value = false
    isLoadingMore.value = false
  }
}

const handleScroll = (e) => {
  const element = e.target
  const bottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 100

  if (bottom && hasMore.value && !loading.value && !isLoadingMore.value) {
    fetchMedia()
  }
}

const selectMedia = (mediaItem) => {
  selectedMedia.value = mediaItem
}

const confirmSelection = () => {
  if (selectedMedia.value) {
    emit('select', selectedMedia.value)
    emit('close')
  }
}

const handleUpload = () => {
  emit('upload')
}

watch(() => props.show, (newVal) => {
  if (newVal) {
    fetchMedia(true)
  }
})

watch(() => props.selectedImage, (newVal) => {
  selectedMedia.value = newVal
})

onMounted(() => {
  if (props.show) {
    fetchMedia(true)
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
        <!-- Overlay -->
        <div
          class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          @click="$emit('close')"
        ></div>

        <!-- Modal -->
        <div class="flex min-h-full items-center justify-center p-4">
          <div
            class="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col"
            @click.stop
          >
            <!-- Header -->
            <div class="flex items-center justify-between p-4 border-b border-gray-200">
              <div class="flex items-center gap-3">
                <ImageIcon class="w-6 h-6 text-gray-600" />
                <h2 class="text-xl font-semibold text-gray-900">Biblioteca de Medios</h2>
              </div>
              <button
                @click="$emit('close')"
                class="text-gray-400 hover:text-gray-600 transition-colors"
                title="Cerrar"
              >
                <X class="w-6 h-6" />
              </button>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-3 p-4 border-b border-gray-200 bg-gray-50">
              <button
                @click="handleUpload"
                class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload class="w-4 h-4" />
                Subir nueva imagen
              </button>

              <!-- Search (opcional para futura implementación) -->
              <!-- <div class="flex-1 relative">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Buscar imágenes..."
                  class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                <Search class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div> -->
            </div>

            <!-- Media Grid -->
            <div
              class="flex-1 overflow-y-auto p-4"
              @scroll="handleScroll"
            >
              <!-- Loading inicial -->
              <div v-if="loading" class="flex items-center justify-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
              </div>

              <!-- Grid de imágenes -->
              <div
                v-else-if="media.length > 0"
                class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3"
              >
                <div
                  v-for="item in media"
                  :key="item.id"
                  @click="selectMedia(item)"
                  :class="[
                    'relative aspect-square rounded-lg overflow-hidden cursor-pointer group border-2 transition-all',
                    selectedMedia?.id === item.id
                      ? 'border-blue-600 ring-2 ring-blue-200'
                      : 'border-transparent hover:border-gray-300'
                  ]"
                >
                  <img
                    :src="getVariantUrl(item, 'small')"
                    :alt="item.originalName"
                    class="w-full h-full object-cover"
                    loading="lazy"
                    @error="(e) => { e.target.src = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'%3E%3Crect fill=\'%23ddd\' width=\'200\' height=\'200\'/%3E%3Ctext fill=\'%23999\' x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\'%3EError%3C/text%3E%3C/svg%3E' }"
                  >

                  <!-- Overlay de selección -->
                  <div
                    v-if="selectedMedia?.id === item.id"
                    class="absolute inset-0 bg-blue-600 bg-opacity-20 flex items-center justify-center"
                  >
                    <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>

                  <!-- Info on hover -->
                  <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p class="text-white text-xs truncate">{{ item.originalName }}</p>
                  </div>
                </div>
              </div>

              <!-- Loading more indicator -->
              <div v-if="isLoadingMore" class="flex items-center justify-center py-6">
                <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              </div>

              <!-- No hay imágenes -->
              <div v-if="!loading && media.length === 0" class="flex flex-col items-center justify-center py-12 text-gray-400">
                <ImageIcon class="w-16 h-16 mb-4" />
                <p class="text-lg font-medium">No hay imágenes en la biblioteca</p>
                <p class="text-sm">Sube tu primera imagen para comenzar</p>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
              <div class="text-sm text-gray-600">
                <span v-if="selectedMedia">
                  Seleccionada: <span class="font-medium">{{ selectedMedia.originalName }}</span>
                </span>
                <span v-else>Selecciona una imagen</span>
              </div>
              <div class="flex gap-3">
                <button
                  @click="$emit('close')"
                  class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  @click="confirmSelection"
                  :disabled="!selectedMedia"
                  :class="[
                    'px-4 py-2 rounded-lg transition-colors',
                    selectedMedia
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  ]"
                >
                  Seleccionar imagen
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .fixed > div,
.modal-leave-active .fixed > div {
  transition: transform 0.3s ease;
}

.modal-enter-from .fixed > div,
.modal-leave-to .fixed > div {
  transform: scale(0.95);
}
</style>
