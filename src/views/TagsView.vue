<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ViewLayout from '@/views/ViewLayout.vue'
import TagList from '@/components/TagList.vue'
import TagModal from '@/components/TagModal.vue'
import BaseButton from '@/components/BaseButton.vue'
import api from '@/utils/api'
import { useBlog } from '@/composables/useBlog'
import { Plus, Tag } from 'lucide-vue-next'

const { t } = useI18n()
const { getCurrentBlogId } = useBlog()
const tags = ref([])
const showModal = ref(false)
const currentTag = ref(null)
const isLoading = ref(false)
const error = ref('')

const fetchTags = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const blogId = await getCurrentBlogId();
    console.log('[TagsView] Fetching tags for blogId:', blogId);

    const response = await api.get('/api/tags', {
      params: { blogId }
    });
    tags.value = response.data;
    console.log('[TagsView] Loaded', tags.value.length, 'tags for blog ID:', blogId);
  } catch (err) {
    error.value = err.response?.data?.message || t('errors.serverConnection');
    console.error('[TagsView] API Error:', {
      url: err.config?.url,
      status: err.response?.status,
      data: err.response?.data
    });
  } finally {
    isLoading.value = false;
  }
};

const handleEdit = (tag) => {
  currentTag.value = { ...tag }
  showModal.value = true
}

const handleCreate = () => {
  currentTag.value = null
  showModal.value = true
}

const handleSave = async (tagData) => {
  try {
    const blogId = await getCurrentBlogId();
    console.log('[TagsView] Saving tag for blogId:', blogId);

    const tagWithBlog = {
      ...tagData,
      blogId: blogId
    };

    if (tagData.id) {
      await api.patch(`/api/tags/${tagData.id}`, tagWithBlog);
    } else {
      await api.post('/api/tags', tagWithBlog);
    }

    await fetchTags();
    showModal.value = false;
  } catch (err) {
    error.value = err.response?.data?.error || err.message || t('tags.saveError');
    console.error('[TagsView] Save Error:', err.response?.data || err);
  }
};

const handleDelete = async (id) => {
  if (!confirm(t('tags.deleteConfirm'))) return;

  try {
    await api.delete(`/api/tags/${id}`);
    await fetchTags();
  } catch (err) {
    error.value = err.response?.data?.message || t('tags.deleteError');
    console.error('Delete Error:', err.response?.data);
  }
}

onMounted(fetchTags)
</script>

<template>
  <ViewLayout>
    <template #title>{{ $t('tags.title') }}</template>
    <template #subtitle>{{ $t('tags.subtitle') }}</template>

    <div class="space-y-6">
      <div v-if="error" class="p-4 bg-red-50 rounded-lg border border-red-200">
        <p class="text-red-600 font-medium">{{ error }}</p>
      </div>

      <div class="flex justify-between items-center">
        <h2 class="text-lg font-medium text-gray-900">{{ $t('tags.listTitle') }}</h2>
        <BaseButton
          variant="primary"
          size="sm"
          @click="handleCreate"
        >
          <template #icon>
            <Plus class="w-4 h-4" />
          </template>
          {{ $t('tags.newTag') }}
        </BaseButton>
      </div>

      <div v-if="isLoading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-800 mx-auto"></div>
        <p class="mt-2 text-gray-600 text-sm">{{ $t('tags.loading') }}</p>
      </div>

      <div v-else-if="!tags.length" class="text-center py-12 bg-white rounded-lg border border-gray-200">
        <div class="text-gray-400 mb-3">
          <Tag class="w-10 h-10" />
        </div>
        <h3 class="text-lg font-medium text-gray-700 mb-1">{{ $t('tags.noTagsFound') }}</h3>
        <p class="text-gray-500 text-sm mb-4">{{ $t('tags.createFirst') }}</p>
        <BaseButton variant="primary" size="sm" @click="handleCreate">
          <template #icon>
            <Plus class="w-4 h-4" />
          </template>
          {{ $t('tags.create') }}
        </BaseButton>
      </div>

      <TagList
        v-else
        :tags="tags"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </div>

    <TagModal
      v-if="showModal"
      :tag="currentTag"
      @save="handleSave"
      @close="showModal = false"
    />
  </ViewLayout>
</template>