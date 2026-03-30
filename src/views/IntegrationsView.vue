<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '@/utils/api'
import { useBlog } from '@/composables/useBlog'
import BaseButton from '@/components/BaseButton.vue'
import { Link, Save, HelpCircle } from 'lucide-vue-next'

const { t } = useI18n()
const { getCurrentBlogId } = useBlog()

const isLoading = ref(false)
const isSaving = ref(false)
const error = ref('')
const success = ref('')

const patreon = ref({
  clientId: '',
  clientSecret: '',
  campaignId: '',
})
const hasExistingSecret = ref(false)

const fetchIntegrations = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const blogId = getCurrentBlogId()
    const response = await api.get(`/api/integrations?blogId=${blogId}`)
    if (response.data.integration) {
      patreon.value.clientId = response.data.integration.patreonClientId || ''
      patreon.value.campaignId = response.data.integration.patreonCampaignId || ''
      hasExistingSecret.value = response.data.hasPatreonSecret
    }
  } catch (err) {
    error.value = err.response?.data?.error || 'Error loading integrations'
  } finally {
    isLoading.value = false
  }
}

const handleSave = async () => {
  isSaving.value = true
  error.value = ''
  success.value = ''
  try {
    const blogId = getCurrentBlogId()
    const data = {
      blogId,
      patreonClientId: patreon.value.clientId || null,
      patreonCampaignId: patreon.value.campaignId || null,
    }
    // Only send secret if it was changed
    if (patreon.value.clientSecret) {
      data.patreonClientSecret = patreon.value.clientSecret
    }
    await api.put('/api/integrations', data)
    success.value = t('integrations.patreon.saveSuccess')
    patreon.value.clientSecret = ''
    hasExistingSecret.value = true
  } catch (err) {
    error.value = err.response?.data?.error || 'Error saving integrations'
  } finally {
    isSaving.value = false
  }
}

onMounted(fetchIntegrations)
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-8">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">{{ $t('integrations.title') }}</h1>
      <p class="text-gray-500 mt-1">{{ $t('integrations.subtitle') }}</p>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center py-12 text-gray-500">Loading...</div>

    <template v-else>
      <!-- Patreon Section -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <div class="flex items-start gap-3 mb-4">
          <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Link class="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h2 class="text-lg font-semibold text-gray-900">{{ $t('integrations.patreon.title') }}</h2>
            <p class="text-sm text-gray-500">{{ $t('integrations.patreon.description') }}</p>
          </div>
        </div>

        <!-- Error/Success -->
        <div v-if="error" class="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{{ error }}</div>
        <div v-if="success" class="mb-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">{{ success }}</div>

        <form @submit.prevent="handleSave" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('integrations.patreon.clientId') }}</label>
            <input
              v-model="patreon.clientId"
              type="text"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., abc123..."
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('integrations.patreon.clientSecret') }}</label>
            <input
              v-model="patreon.clientSecret"
              type="password"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              :placeholder="hasExistingSecret ? '••••••••••••' : 'e.g., secret_xyz...'"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('integrations.patreon.campaignId') }}</label>
            <input
              v-model="patreon.campaignId"
              type="text"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 12345678"
            />
          </div>

          <!-- Help text -->
          <div class="flex items-start gap-2 p-3 bg-blue-50 rounded-md text-sm text-blue-700">
            <HelpCircle class="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{{ $t('integrations.patreon.help') }}</span>
          </div>

          <div class="flex justify-end">
            <BaseButton type="submit" variant="primary" :disabled="isSaving">
              <span class="flex items-center gap-2">
                <Save class="w-4 h-4" />
                {{ isSaving ? $t('common.saving') : $t('common.save') }}
              </span>
            </BaseButton>
          </div>
        </form>
      </div>
    </template>
  </div>
</template>
