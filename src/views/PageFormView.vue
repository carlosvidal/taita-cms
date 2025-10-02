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
const page = ref({
  title: '',
  slug: '',
  content: '',
  status: 'draft',
  excerpt: '',
  featuredImage: null,
  existingImage: null,
  removeImage: false,
  imagePreview: null,
  imageId: null
})

const isEditMode = computed(() => {
  return !!route.params.uuid
})

const pageTitle = computed(() => {
  return isEditMode.value ? t('pages.editPage') : t('pages.newPage')
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

const fetchPage = async (uuid) => {
  isLoading.value = true
  try {
    const response = await api.get(`/api/pages/uuid/${uuid}`)
    page.value = {
      ...page.value,
      ...response.data,
      status: response.data.status === 'PUBLISHED' ? 'published' : 'draft',
      existingImage: response.data.image || null,
      imageId: response.data.imageId || null,
      removeImage: false
    }
  } catch (err) {
    console.error('Error al obtener página:', err)
    error.value = err.response?.data?.message || err.response?.data?.error || err.message || t('pages.loadError')
  } finally {
    isLoading.value = false
  }
}

const handleSubmit = async () => {
  try {
    isSaving.value = true;
    error.value = '';

    if (!page.value.title?.trim()) {
      throw new Error(t('validation.titleRequired'));
    }
    if (!page.value.content?.trim()) {
      throw new Error(t('validation.contentRequired'));
    }
    if (page.value.excerpt?.length > 160) {
      throw new Error(t('validation.excerptTooLong'));
    }

    const authUser = JSON.parse(localStorage.getItem('authUser'));
    let authorId = authUser?.id || 1;

    let blogId = null;
    const activeBlogUuid = localStorage.getItem('activeBlog');
    if (!activeBlogUuid) {
      alert(t('posts.noBlogSelectedRedirect'));
      router.push('/blogs');
      return;
    }
    try {
      const blogResponse = await api.get(`/api/blogs/uuid/${activeBlogUuid}`);
      const blogData = blogResponse.data;
      if (!blogData || !blogData.id) {
        alert(t('posts.blogInfoErrorRedirect'));
        router.push('/blogs');
        return;
      }
      blogId = blogData.id;
    } catch (error) {
      alert(t('posts.blogInfoError'));
      router.push('/blogs');
      return;
    }

    const pageData = {
      title: page.value.title,
      content: page.value.content,
      excerpt: page.value.excerpt,
      status: page.value.status,
      authorId: authorId,
      blogId: blogId
    };

    if (page.value.slug && page.value.slug.trim() !== '') {
      pageData.slug = page.value.slug.trim();
    } else {
      const timestamp = new Date().getTime().toString().slice(-6);
      const baseSlug = page.value.title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      pageData.slug = `${baseSlug}-${timestamp}`;
    }

    if (page.value.existingImage && !page.value.removeImage && !page.value.featuredImage) {
      pageData.image = page.value.existingImage;
      pageData.imageId = page.value.imageId;
    }

    let savedPage;
    if (isEditMode.value) {
      const response = await api.patch(`/api/pages/uuid/${route.params.uuid}`, pageData);
      savedPage = response.data;
    } else {
      const response = await api.post('/api/pages', pageData);
      savedPage = response.data;
    }

    if (page.value.featuredImage && page.value.featuredImage instanceof File) {
      try {
        const formData = new FormData();
        formData.append('image', page.value.featuredImage);
        formData.append('entityType', 'page');
        formData.append('entityId', savedPage.uuid);

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
          const mediaData = responseData.media || responseData;
          const imageUpdateData = {
            image: mediaData.url || mediaData.path,
            imageId: mediaData.id
          };
          await api.patch(`/api/pages/uuid/${savedPage.uuid}`, imageUpdateData);
          await fetchPage(savedPage.uuid);
        }
      } catch (imageError) {
        console.error('Error al subir la imagen:', imageError);
      }
    } else if (page.value.removeImage) {
      try {
        await api.patch(`/api/pages/uuid/${savedPage.uuid}`, { removeImage: true });
      } catch (removeError) {
        console.error('Error al eliminar la imagen:', removeError);
      }
    }

    router.push('/cms/pages');
  } catch (err) {
    console.error('Error completo:', err);
    error.value = err.response?.data?.message || err.response?.data?.error || err.message || t('pages.saveError');
  } finally {
    isSaving.value = false;
  }
}

onMounted(async () => {
  if (isEditMode.value) {
    try {
      await fetchPage(route.params.uuid)
    } catch (err) {
      console.error('Error in onMounted fetchPage:', err)
      error.value = t('pages.loadError')
    }
  }
})

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.match('image/(jpeg|jpg|png|webp)')) {
    error.value = t('media.invalidImageFormat');
    return;
  }

  const img = new Image();
  img.onload = function () {
    if (this.width < 800 || this.height < 600) {
      error.value = t('media.imageTooSmall', { width: this.width, height: this.height });
      return;
    }
    page.value.featuredImage = file;
    page.value.removeImage = false;
    page.value.imagePreview = URL.createObjectURL(file);
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
  page.value.existingImage = media.url;
  page.value.imageId = media.id;
  page.value.featuredImage = null;
  page.value.removeImage = false;
  page.value.imagePreview = null;
  showMediaLibrary.value = false;
};

const handleMediaUploadFromModal = (media) => {
  page.value.existingImage = media.url;
  page.value.imageId = media.id;
  page.value.featuredImage = null;
  page.value.removeImage = false;
  page.value.imagePreview = null;
  showMediaLibrary.value = false;
};

const removeImage = () => {
  page.value.featuredImage = null;
  page.value.removeImage = true;
}

const checkSlugAvailability = async (slug) => {
  if (!slug || (isEditMode.value && page.value.slug === slug)) return;

  try {
    const response = await api.get(`/api/pages/check-slug?slug=${encodeURIComponent(slug)}`);
    if (response.data.exists) {
      error.value = t('pages.slugInUse', { slug });
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
</script>

<template>
  <div class="max-w-4xl mx-auto py-4 px-2 sm:py-8 sm:px-6 lg:px-8">
    <div v-if="isLoading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-panel mx-auto"></div>
      <p class="mt-4 text-gray-600">{{ $t('common.loading') }}</p>
    </div>

    <template v-else>
      <div v-if="error" class="mb-6 p-4 bg-panel rounded border border-panel">
        <p class="text-red-600 font-medium">{{ error }}</p>
      </div>

      <div :class="['bg-panel overflow-hidden sm:border sm:border-panel sm:rounded sm:shadow-md']">
        <div class="p-3 sm:p-6 border-b border-panel flex justify-between items-center">
          <h1 class="text-2xl font-bold text-gray-900">{{ pageTitle }}</h1>
          <BaseButton variant="ghost" size="sm" @click="router.push('/cms/pages')" :disabled="isSaving">
            <span class="flex items-center whitespace-nowrap">
              <ArrowLeft class="w-4 h-4 mr-2" />
              {{ $t('pages.backToPages') }}
            </span>
          </BaseButton>
        </div>

        <form @submit.prevent="handleSubmit" class="p-3 sm:p-6 space-y-4 sm:space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('common.title') }}</label>
            <input v-model="page.title" required :placeholder="$t('pages.form.titlePlaceholder')"
              class="w-full px-4 py-2 rounded border border-panel focus:ring-2 focus:ring-panel focus:border-panel transition-all duration-200">
          </div>

          <SlugField v-model="page.slug" :source-text="page.title" prefix="/" :label="$t('posts.slug')" placeholder="mi-pagina"
            :hint="$t('pages.form.slugHelp')"
            @check-availability="checkSlugAvailability" />

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('posts.content') }}</label>
            <TipTapEditor v-model="page.content"
              class="min-h-[200px] border border-panel rounded focus:ring-2 focus:ring-panel overflow-hidden transition-all duration-200" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('pages.form.excerptLabel') }}</label>
            <textarea v-model="page.excerpt" maxlength="160" :placeholder="$t('pages.form.excerptPlaceholder')"
              class="w-full px-4 py-2 rounded border border-panel focus:ring-2 focus:ring-panel focus:border-panel transition-all duration-200"
              rows="3"></textarea>
            <p class="text-xs text-gray-500 mt-1">{{ $t('pages.form.excerptCounter', { count: page.excerpt?.length || 0 }) }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('posts.featuredImage') }}</label>

            <div v-if="(page.existingImage || page.imagePreview) && !page.removeImage" class="mt-2 mb-3">
              <div class="relative w-64 h-40 overflow-hidden rounded border border-panel">
                <img :src="page.imagePreview || getFullImageUrl(page.existingImage)"
                  :alt="page.imagePreview ? $t('pages.form.imagePreview') : `${$t('posts.featuredImage')}: ${page.existingImage}`"
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
              <div v-if="page.imageId" class="mt-2 text-sm text-gray-500">
                {{ $t('pages.form.imageId', { id: page.imageId }) }}
              </div>
            </div>

            <div v-if="!page.existingImage || page.removeImage" class="mt-1 flex flex-wrap gap-2">
              <BaseButton type="button" variant="secondary" @click="openMediaLibrary">
                <Library class="w-4 h-4 mr-2" />
                {{ $t('media.selectFromLibrary') }}
              </BaseButton>

              <input type="file" id="featuredImage" accept="image/jpeg,image/png,image/webp" @change="handleImageUpload"
                class="sr-only">
              <label for="featuredImage">
                <BaseButton type="button" variant="secondary" as="span">
                  <Upload class="w-4 h-4 mr-2" />
                  {{ $t('media.uploadNewImage') }}
                </BaseButton>
              </label>
            </div>

            <div v-if="page.removeImage && !page.featuredImage" class="mt-2 text-sm text-yellow-600">
              {{ $t('pages.form.imageWillBeDeleted') }}
              <button @click="page.removeImage = false" type="button" class="ml-2 text-blue-600 hover:underline">
                {{ $t('common.cancel') }}
              </button>
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-between pt-6 border-t border-panel">
            <div class="flex items-center mb-4 sm:mb-0">
              <div class="relative inline-block w-14 mr-2 align-middle select-none">
                <input type="checkbox" :checked="page.status === 'published'"
                  @change="page.status = $event.target.checked ? 'published' : 'draft'"
                  class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-panel border-2 appearance-none cursor-pointer" />
                <label class="toggle-label block overflow-hidden h-6 rounded-full bg-panel"></label>
              </div>
              <span :class="{
                'text-sm font-medium': true,
                'text-green-600': page.status === 'published',
                'text-yellow-600': page.status === 'draft'
              }">
                {{ page.status === 'published' ? $t('posts.published') : $t('posts.draft') }}
              </span>
            </div>

            <div class="flex gap-3 ml-auto">
              <BaseButton type="button" variant="secondary" @click="router.push('/cms/pages')" :disabled="isSaving">
                {{ $t('common.cancel') }}
              </BaseButton>
              <BaseButton type="submit" variant="primary" :disabled="isSaving">
                <span class="flex items-center whitespace-nowrap">
                  <svg v-if="isSaving" class="animate-spin mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg"
                    fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                  </svg>
                  <Save v-else class="w-4 h-4 mr-2" />
                  {{ isSaving ? $t('common.saving') : $t('pages.form.savePage') }}
                </span>
              </BaseButton>
            </div>
          </div>
        </form>
      </div>
    </template>

    <MediaLibraryModal :show="showMediaLibrary" @close="showMediaLibrary = false" @select="handleMediaSelect"
      @upload="handleMediaUploadFromModal" />
  </div>
</template>
<style scoped>
.toggle-checkbox {
  position: absolute;
  left: 0;
  top: 0;
  background-color: grey;
  border: 2px solid #CBD5E0;
  transition: all 0.3s ease-in-out;
  z-index: 1;
}

.toggle-checkbox:checked {
  transform: translateX(125%);
  border-color: #68D391;
}

.toggle-checkbox:checked+.toggle-label {
  background-color: #68D391;
}

.toggle-label {
  transition: background-color 0.3s ease-in-out;
}
</style>