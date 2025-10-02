<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import ViewLayout from '@/views/ViewLayout.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseTable from '@/components/BaseTable.vue'
import api from '@/utils/api'
import { Plus, Library, Edit, Trash2, Eye } from 'lucide-vue-next'

const { t, locale } = useI18n()
const router = useRouter()
const series = ref([])
const isLoading = ref(false)
const activeBlog = ref(null)

const formatDate = (dateString) => {
  if (!dateString) return t('posts.dateUnavailable')
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return t('posts.invalidDate')
  return new Intl.DateTimeFormat(locale.value, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const getActiveBlog = async () => {
  try {
    const blogUuid = localStorage.getItem('activeBlog')
    if (blogUuid) {
      const response = await api.get(`/api/blogs/uuid/${blogUuid}`)
      activeBlog.value = response.data
    }
  } catch (error) {
    console.error('Error al obtener el blog activo:', error)
  }
}

const fetchSeries = async () => {
  isLoading.value = true
  try {
    const response = await api.get('/api/series')
    series.value = response.data
  } catch (error) {
    console.error('Error fetching series:', error)
  } finally {
    isLoading.value = false
  }
}

const viewSeries = (item) => {
  if (!item.slug) {
    alert(t('series.invalidSlug'))
    return
  }
  const blogSubdomain = activeBlog.value?.subdomain || 'demo'
  const blogDomain = activeBlog.value?.domain || 'taita.blog'
  const url = `https://${blogSubdomain}.${blogDomain}/series/${item.slug}`
  window.open(url, '_blank')
}

const handleDelete = async (uuid) => {
  if (!confirm(t('series.deleteConfirm'))) return

  try {
    await api.delete(`/api/series/uuid/${uuid}`)
    await fetchSeries()
  } catch (error) {
    console.error('Error deleting series:', error)
  }
}

onMounted(async () => {
  await getActiveBlog()
  await fetchSeries()
})
</script>

<template>
  <ViewLayout>
    <template #title>{{ $t('series.title') }}</template>
    <template #subtitle>{{ $t('series.subtitle') }}</template>
    
    <div class="flex justify-between items-center mb-6">
      <div>
        <p v-if="series.length" class="text-gray-500 text-sm">
          {{ $t('series.seriesFound', { count: series.length }) }}
        </p>
      </div>
      
      <BaseButton 
        variant="primary" 
        @click="router.push('/cms/series/new')"
      >
        <span class="flex items-center whitespace-nowrap">
          <Plus class="w-4 h-4 mr-2" />
          {{ $t('series.addSeries') }}
        </span>
      </BaseButton>
    </div>
    
    <div v-if="isLoading" class="py-8 text-center text-gray-500">
      <div class="animate-pulse flex justify-center">
        <div class="h-4 w-24 bg-gray-200 rounded"></div>
      </div>
      <p class="mt-2 text-sm">{{ $t('series.loading') }}</p>
    </div>
    
    <div v-else-if="!series.length" class="py-12 text-center">
      <div class="text-gray-400 mb-3">
        <Library class="w-10 h-10 mx-auto" />
      </div>
      <h3 class="text-lg font-medium text-gray-700 mb-1">{{ $t('series.noSeriesFound') }}</h3>
      <p class="text-gray-500 text-sm">{{ $t('series.createFirst') }}</p>
    </div>
    
    <BaseTable v-else class="text-sm">
      <template #header>
        <th>{{ $t('common.title') }}</th>
        <th>{{ $t('common.author') }}</th>
        <th>{{ $t('posts.title') }}</th>
        <th>{{ $t('posts.lastEdited') }}</th>
        <th>{{ $t('common.actions') }}</th>
      </template>
      
      <template #body>
        <tr v-for="item in series" :key="item.id" class="hover:bg-gray-50">
          <td>
            <div class="flex items-center">
              <div class="flex-shrink-0 h-8 w-8 bg-gray-100 rounded flex items-center justify-center text-gray-500">
                <Library class="w-4 h-4" />
              </div>
              <div class="ml-3">
                <div class="text-sm font-medium text-gray-900">{{ item.title }}</div>
                <div class="text-xs text-gray-500">{{ item.slug }}</div>
              </div>
            </div>
          </td>
          <td>
            <div class="text-sm text-gray-900">{{ item.author?.name || $t('posts.noAuthor') }}</div>
            <div class="text-xs text-gray-500">{{ item.author?.email }}</div>
          </td>
          <td>
            <div class="text-sm text-gray-900">
              {{ $t('series.postCount', { count: item.posts?.length || 0 }) }}
            </div>
          </td>
          <td>
            <div class="text-sm text-gray-500">
              {{ formatDate(item.updatedAt) }}
            </div>
          </td>
          <td>
            <div class="flex gap-2">
              <button
                @click="() => viewSeries(item)"
                class="p-1 rounded hover:bg-blue-50 text-blue-600 transition-colors"
                :title="$t('posts.viewInFrontend')"
              >
                <Eye class="w-4 h-4" />
              </button>
              <button
                @click="router.push(`/cms/series/${item.uuid}`)"
                class="p-1 rounded hover:bg-gray-100 text-gray-600 transition-colors"
                :title="$t('series.editSeries')"
              >
                <Edit class="w-4 h-4" />
              </button>
              <button
                @click="handleDelete(item.uuid)"
                class="p-1 rounded hover:bg-red-50 text-red-600 transition-colors"
                :title="$t('series.deleteSeries')"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </td>
        </tr>
      </template>
    </BaseTable>
  </ViewLayout>
</template>