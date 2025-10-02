<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '@/utils/api'
import TipTapEditor from '@/components/TipTapEditor.vue'
import BaseButton from '@/components/BaseButton.vue'
import SlugField from '@/components/SlugField.vue'
import MediaLibraryModal from '@/components/MediaLibraryModal.vue'
import { transitions, rounded, shadows } from '@/styles/designSystem'
import { ArrowLeft, Save, Library, Upload } from 'lucide-vue-next'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const isLoading = ref(false)
const isSaving = ref(false)
const error = ref('')
const showMediaLibrary = ref(false)
const series = ref({
  title: '',
  slug: '',
  description: '',
  coverImage: null,
  existingCoverImage: null,
  removeCoverImage: false,
  imagePreview: null,
  imageId: null
})
const posts = ref([])

const isEditMode = computed(() => !!route.params.uuid)

const pageTitle = computed(() => {
  return isEditMode.value ? t('series.editSeries') : t('series.newSeries')
})

const apiBaseUrl = computed(() => {
  return import.meta.env.VITE_API_URL || 'http://localhost:3000'
})

const getFullImageUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  const cleanPath = path.startsWith('/') ? path.substring(1) : path
  return `${apiBaseUrl.value}/${cleanPath}`
}

const fetchSeries = async (uuid) => {
  isLoading.value = true
  try {
    const response = await api.get(`/api/series/uuid/${uuid}`)
    series.value = {
      ...series.value,
      ...response.data,
      existingCoverImage: response.data.coverImage || null,
      removeCoverImage: false
    }
    posts.value = response.data.posts || []
    posts.value.sort((a, b) => (a.sequenceNumber || 0) - (b.sequenceNumber || 0))
  } catch (err) {
    console.error('Error al obtener serie:', err)
    error.value = err.response?.data?.message || err.response?.data?.error || err.message || t('series.loadError')
  } finally {
    isLoading.value = false
  }
}

const handleSubmit = async () => {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    router.push('/login');
    return;
  }
  
  try {
    isSaving.value = true;
    error.value = '';

    if (!series.value.title?.trim()) {
      throw new Error(t('validation.titleRequired'));
    }
    if (!series.value.slug?.trim()) {
      throw new Error(t('validation.slugRequired'));
    }

    const authUser = JSON.parse(localStorage.getItem('authUser'));
    if (!authUser?.id) {
      throw new Error(t('errors.authError'));
    }
    const authorId = authUser.id;

    const activeBlogUuid = localStorage.getItem('activeBlog');
    if (!activeBlogUuid) {
      throw new Error(t('posts.noBlogSelected'));
    }

    const blogResponse = await api.get(`/api/blogs/uuid/${activeBlogUuid}`);
    const blogId = blogResponse.data.id;

    const seriesData = {
      title: series.value.title.trim(),
      description: series.value.description?.trim() || '',
      slug: series.value.slug?.trim() || null,
      authorId: parseInt(authorId),
      blogId: parseInt(blogId)
    };

    if (series.value.existingCoverImage && !(series.value.coverImage instanceof File)) {
      seriesData.coverImage = series.value.existingCoverImage;
    }
    
    let savedSeries;
    try {
      if (isEditMode.value) {
        const response = await api.patch(`/api/series/uuid/${route.params.uuid}`, seriesData);
        savedSeries = response.data;
      } else {
        const response = await api.post('/api/series', seriesData);
        savedSeries = response.data;
      }
    } catch (err) {
      console.error('Error al guardar la serie:', err);
      throw new Error(err.response?.data?.error || err.response?.data?.message || t('series.saveError'));
    }

    if (series.value.coverImage && series.value.coverImage instanceof File) {
      try {
        const formData = new FormData();
        formData.append('image', series.value.coverImage);
        formData.append('entityType', 'series');
        formData.append('entityId', savedSeries.uuid);

        const token = localStorage.getItem('authToken')
        if (!token) {
          throw new Error(t('errors.authTokenNotFound'))
        }
        
        const response = await fetch(`${apiBaseUrl.value}/api/media/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        
        const responseData = await response.json();
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${JSON.stringify(responseData)}`);
        }

        if (responseData) {
          try {
            const updateResponse = await fetch(`${apiBaseUrl.value}/api/series/uuid/${savedSeries.uuid}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ coverImage: responseData.original || responseData.path })
            });
            
            if (!updateResponse.ok) {
              const updateResponseData = await updateResponse.json();
              throw new Error(`Error ${updateResponse.status}: ${JSON.stringify(updateResponseData)}`);
            }
          } catch (updateError) {
            console.error('Error al actualizar serie con imagen:', updateError);
          }
        }
      } catch (imageError) {
        console.error('Error al subir la imagen:', imageError);
      }
    } else if (series.value.removeCoverImage) {
      try {
        await api.patch(`/api/series/uuid/${savedSeries.uuid}`, { coverImage: null });
      } catch (removeError) {
        console.error('Error al eliminar la imagen:', removeError);
      }
    }

    router.push('/cms/series');

  } catch (err) {
    console.error('Series error:', err);
    error.value = err.response?.data?.message || err.message || t('series.saveError');
  } finally {
    isSaving.value = false;
  }
}

const checkSlugAvailability = async (slug) => {
  if (!slug || (isEditMode.value && series.value.slug === slug)) return;
  
  try {
    const response = await api.get(`/api/series/check-slug?slug=${encodeURIComponent(slug)}`);
    if (response.data.exists) {
      error.value = t('series.slugInUse', { slug });
      return false;
    } else {
      error.value = '';
      return true;
    }
  } catch (err) {
    console.error('Error al verificar disponibilidad del slug:', err);
    return true;
  }
};

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.match('image/(jpeg|jpg|png|webp)')) {
    error.value = t('media.invalidImageFormat');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    error.value = t('media.imageTooLarge');
    return;
  }

  const img = new Image();
  img.onload = function () {
    if (this.width < 800 || this.height < 600) {
      error.value = t('media.imageTooSmall', { width: this.width, height: this.height });
      return;
    }
    series.value.coverImage = file;
    series.value.removeCoverImage = false;
    series.value.imagePreview = URL.createObjectURL(file);
  };
  img.onerror = () => {
    error.value = t('media.imageLoadError');
  };
  img.src = URL.createObjectURL(file);
};

const openMediaLibrary = () => {
  showMediaLibrary.value = true;
};

const handleMediaSelect = (media) => {
  series.value.existingCoverImage = media.url;
  series.value.imageId = media.id;
  series.value.coverImage = null;
  series.value.removeCoverImage = false;
  series.value.imagePreview = null;
  showMediaLibrary.value = false;
};

const handleMediaUploadFromModal = (media) => {
  series.value.existingCoverImage = media.url;
  series.value.imageId = media.id;
  series.value.coverImage = null;
  series.value.removeCoverImage = false;
  series.value.imagePreview = null;
  showMediaLibrary.value = false;
};

const removeImage = () => {
  series.value.coverImage = null;
  series.value.removeCoverImage = true;
};

onMounted(async () => {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    router.push('/login');
    return;
  }
  if (isEditMode.value) {
    await fetchSeries(route.params.uuid);
  }
});
</script>

<template>
  <div class="max-w-4xl mx-auto py-4 px-2 sm:py-8 sm:px-6 lg:px-8">
    <div v-if="isLoading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-800 mx-auto"></div>
      <p class="mt-4 text-gray-600">{{ $t('common.loading') }}</p>
    </div>

    <template v-else>
      <div v-if="error" class="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
        <p class="text-red-600 font-medium">{{ error }}</p>
      </div>

      <div :class="['bg-white overflow-hidden sm:border sm:border-gray-200 sm:rounded sm:shadow-md']">
        <div class="p-3 sm:p-6 border-b border-gray-200 flex justify-between items-center">
          <h1 class="text-2xl font-bold text-gray-900">{{ pageTitle }}</h1>
        </div>

        <form @submit.prevent="handleSubmit" class="p-3 sm:p-6 space-y-4 sm:space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('common.title') }}</label>
            <input v-model="series.title" required :placeholder="$t('series.form.titlePlaceholder')"
              class="w-full px-4 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all duration-200">
          </div>

          <SlugField
            v-model="series.slug"
            :source-text="series.title"
            prefix="/series/"
            :label="$t('posts.slug')"
            placeholder="mi-serie"
            :hint="$t('series.form.slugHelp')"
            @check-availability="checkSlugAvailability"
          />

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('common.description') }}</label>
            <textarea v-model="series.description" :placeholder="$t('series.form.descriptionPlaceholder')"
              class="w-full px-4 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all duration-200"
              rows="3"></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('series.form.coverImage') }}</label>

            <div v-if="(series.existingCoverImage || series.imagePreview) && !series.removeCoverImage" class="mt-2 mb-3">
              <div class="relative w-64 h-40 overflow-hidden rounded border border-gray-200">
                <img :src="series.imagePreview || getFullImageUrl(series.existingCoverImage)"
                  :alt="series.imagePreview ? $t('pages.form.imagePreview') : `${$t('series.form.coverImage')}: ${series.existingCoverImage}`"
                  class="object-cover w-full h-full">
                <button @click="removeImage" type="button"
                  class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none"
                  :title="$t('posts.removeImage')">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div v-if="series.imageId" class="mt-2 text-sm text-gray-500">
                {{ $t('pages.form.imageId', { id: series.imageId }) }}
              </div>
            </div>

            <div v-if="!series.existingCoverImage || series.removeCoverImage" class="mt-1 flex flex-wrap gap-2">
              <BaseButton type="button" variant="secondary" @click="openMediaLibrary">
                <Library class="w-4 h-4 mr-2" />
                {{ $t('media.selectFromLibrary') }}
              </BaseButton>

              <input type="file" id="coverImage" accept="image/jpeg,image/png,image/webp" @change="handleImageUpload"
                class="sr-only">
              <label for="coverImage">
                <BaseButton type="button" variant="secondary" as="span">
                  <Upload class="w-4 h-4 mr-2" />
                  {{ $t('media.uploadNewImage') }}
                </BaseButton>
              </label>
            </div>

            <div v-if="series.removeCoverImage && !series.coverImage" class="mt-2 text-sm text-yellow-600">
              {{ $t('pages.form.imageWillBeDeleted') }}
              <button @click="series.removeCoverImage = false" type="button" class="ml-2 text-blue-600 hover:underline">
                {{ $t('common.cancel') }}
              </button>
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-between pt-6 border-t border-gray-100">
            <BaseButton
              variant="secondary"
              @click="router.push('/cms/series')"
              class="mb-4 sm:mb-0"
            >
              <span class="flex items-center">
                <ArrowLeft class="w-4 h-4 mr-2" />
                {{ $t('common.back') }}
              </span>
            </BaseButton>

            <BaseButton
              variant="primary"
              type="submit"
              :disabled="isSaving"
              :class="{ 'opacity-70 cursor-not-allowed': isSaving }"
            >
              <span class="flex items-center">
                <Save class="w-4 h-4 mr-2" />
                {{ isSaving ? $t('common.saving') : $t('common.save') }}
              </span>
            </BaseButton>
          </div>
        </form>
      </div>

      <div v-if="isEditMode && posts.length > 0" class="mt-8">
        <h2 class="text-xl font-bold text-gray-900 mb-4">{{ $t('series.form.postsInSeries') }}</h2>
        
        <div class="bg-white overflow-hidden sm:border sm:border-gray-200 sm:rounded sm:shadow-md">
          <ul class="divide-y divide-gray-200">
            <li v-for="post in posts" :key="post.id" class="p-4 flex items-center justify-between">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-8 w-8 bg-gray-100 rounded flex items-center justify-center text-gray-500">
                  <span class="text-sm font-medium">{{ post.sequenceNumber || '?' }}</span>
                </div>
                <div class="ml-3">
                  <div class="text-sm font-medium text-gray-900">{{ post.title }}</div>
                  <div class="text-xs text-gray-500">{{ post.slug }}</div>
                </div>
              </div>
              
              <div class="flex gap-2">
                <button
                  @click="router.push(`/posts/${post.uuid}`)"
                  class="text-gray-500 hover:text-gray-700"
                  :title="$t('posts.editPost')"
                >
                  <Edit class="w-4 h-4" />
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </template>

    <MediaLibraryModal :show="showMediaLibrary" @close="showMediaLibrary = false" @select="handleMediaSelect"
      @upload="handleMediaUploadFromModal" />
  </div>
</template>