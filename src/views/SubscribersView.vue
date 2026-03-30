<script setup>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '@/utils/api'
import { useBlog } from '@/composables/useBlog'
import { Users, Trash2, Search, Crown, Mail } from 'lucide-vue-next'

const { t } = useI18n()
const { getCurrentBlogId } = useBlog()

const subscribers = ref([])
const stats = ref({ total: 0, free: 0, premium: 0, confirmed: 0, unconfirmed: 0 })
const isLoading = ref(false)
const error = ref('')
const searchQuery = ref('')
const filterTier = ref('')
const currentPage = ref(1)
const pagination = ref({ total: 0, pages: 1 })

const fetchSubscribers = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const blogId = getCurrentBlogId()
    const params = new URLSearchParams({ blogId, page: currentPage.value, limit: 50 })
    if (filterTier.value) params.append('tier', filterTier.value)
    if (searchQuery.value) params.append('search', searchQuery.value)

    const [subsRes, statsRes] = await Promise.all([
      api.get(`/api/subscriber-management?${params}`),
      api.get(`/api/subscriber-management/stats?blogId=${blogId}`)
    ])

    subscribers.value = subsRes.data.subscribers
    pagination.value = subsRes.data.pagination
    stats.value = statsRes.data
  } catch (err) {
    error.value = err.response?.data?.error || 'Error loading subscribers'
  } finally {
    isLoading.value = false
  }
}

const handleDelete = async (uuid) => {
  if (!confirm(t('subscribers.deleteConfirm'))) return
  try {
    await api.delete(`/api/subscriber-management/${uuid}`)
    await fetchSubscribers()
  } catch (err) {
    error.value = err.response?.data?.error || 'Error deleting subscriber'
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchSubscribers()
}

const handleFilterChange = (tier) => {
  filterTier.value = tier
  currentPage.value = 1
  fetchSubscribers()
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString()
}

onMounted(fetchSubscribers)
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ $t('subscribers.title') }}</h1>
        <p class="text-gray-500 mt-1">{{ $t('subscribers.subtitle') }}</p>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-lg border border-gray-200 p-4 text-center">
        <div class="text-2xl font-bold text-gray-900">{{ stats.total }}</div>
        <div class="text-sm text-gray-500">{{ $t('subscribers.total') }}</div>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-4 text-center">
        <div class="text-2xl font-bold text-blue-600">{{ stats.free }}</div>
        <div class="text-sm text-gray-500">{{ $t('subscribers.free') }}</div>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-4 text-center">
        <div class="text-2xl font-bold text-amber-600">{{ stats.premium }}</div>
        <div class="text-sm text-gray-500">{{ $t('subscribers.premium') }}</div>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-4 text-center">
        <div class="text-2xl font-bold text-green-600">{{ stats.confirmed }}</div>
        <div class="text-sm text-gray-500">{{ $t('subscribers.confirmed') }}</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-3 mb-4">
      <div class="relative flex-1 min-w-[200px]">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          v-model="searchQuery"
          @keyup.enter="handleSearch"
          :placeholder="$t('subscribers.search')"
          class="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div class="flex gap-1">
        <button
          @click="handleFilterChange('')"
          :class="['px-3 py-2 text-sm rounded-md border', !filterTier ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50']"
        >{{ $t('subscribers.filterAll') }}</button>
        <button
          @click="handleFilterChange('FREE')"
          :class="['px-3 py-2 text-sm rounded-md border', filterTier === 'FREE' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50']"
        >{{ $t('subscribers.free') }}</button>
        <button
          @click="handleFilterChange('PREMIUM')"
          :class="['px-3 py-2 text-sm rounded-md border', filterTier === 'PREMIUM' ? 'bg-amber-50 border-amber-300 text-amber-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50']"
        >{{ $t('subscribers.premium') }}</button>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{{ error }}</div>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center py-12 text-gray-500">Loading...</div>

    <!-- Empty State -->
    <div v-else-if="subscribers.length === 0" class="text-center py-12">
      <Users class="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p class="text-gray-500">{{ $t('subscribers.noSubscribers') }}</p>
    </div>

    <!-- Table -->
    <div v-else class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50">
          <tr>
            <th class="text-left px-4 py-3 font-medium text-gray-600">{{ $t('subscribers.email') }}</th>
            <th class="text-left px-4 py-3 font-medium text-gray-600">{{ $t('subscribers.name') }}</th>
            <th class="text-left px-4 py-3 font-medium text-gray-600">{{ $t('subscribers.tier') }}</th>
            <th class="text-left px-4 py-3 font-medium text-gray-600">{{ $t('subscribers.subscribedAt') }}</th>
            <th class="text-right px-4 py-3 font-medium text-gray-600"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="sub in subscribers" :key="sub.uuid" class="hover:bg-gray-50">
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <Mail class="w-4 h-4 text-gray-400" />
                <span>{{ sub.email }}</span>
                <span v-if="!sub.confirmedAt" class="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                  {{ $t('subscribers.unconfirmed') }}
                </span>
              </div>
            </td>
            <td class="px-4 py-3 text-gray-600">{{ sub.name || '-' }}</td>
            <td class="px-4 py-3">
              <span v-if="sub.tier === 'PREMIUM'" class="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                <Crown class="w-3 h-3" /> {{ $t('subscribers.premium') }}
              </span>
              <span v-else class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {{ $t('subscribers.free') }}
              </span>
            </td>
            <td class="px-4 py-3 text-gray-500">{{ formatDate(sub.createdAt) }}</td>
            <td class="px-4 py-3 text-right">
              <button @click="handleDelete(sub.uuid)" class="text-red-500 hover:text-red-700 p-1">
                <Trash2 class="w-4 h-4" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.pages > 1" class="flex justify-center gap-2 mt-4">
      <button
        v-for="page in pagination.pages" :key="page"
        @click="currentPage = page; fetchSubscribers()"
        :class="['px-3 py-1 text-sm rounded', page === currentPage ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200']"
      >{{ page }}</button>
    </div>
  </div>
</template>
