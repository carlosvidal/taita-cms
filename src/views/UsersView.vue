<template>
  <ViewLayout>
    <template #title>{{ $t('users.title') }}</template>
    <template #subtitle>{{ $t('users.subtitle') }}</template>
    
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <p v-if="users.length" class="text-gray-500 text-sm">
            {{ $t('users.usersFound', { count: users.length }) }}
          </p>
        </div>
        
        <BaseButton 
          @click="router.push('/cms/users/new')" 
          variant="primary"
          class="flex items-center gap-2"
        >
          <Plus class="w-4 h-4" />
          <span>{{ $t('users.newUser') }}</span>
        </BaseButton>
      </div>
      
      <div v-if="isLoading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
      
      <div v-else-if="!users.length" class="text-center py-12 bg-gray-50 rounded-md">
        <div class="text-gray-400 mb-3">
          <UserCircle class="w-12 h-12 mx-auto" />
        </div>
        <h3 class="text-lg font-medium text-gray-700 mb-1">{{ $t('users.noUsersFound') }}</h3>
        <p class="text-gray-500 text-sm mb-4">{{ $t('users.createFirst') }}</p>
        <BaseButton 
          @click="router.push('/cms/users/new')" 
          variant="primary" 
          size="sm"
        >
          {{ $t('users.createUser') }}
        </BaseButton>
      </div>
      
      <div v-else class="overflow-hidden bg-white rounded-md border border-gray-200">
        <BaseTable>
          <template #header>
            <BaseTableHead>{{ $t('common.name') }}</BaseTableHead>
            <BaseTableHead>{{ $t('common.email') }}</BaseTableHead>
            <BaseTableHead>{{ $t('users.role') }}</BaseTableHead>
            <BaseTableHead class="text-right">{{ $t('common.actions') }}</BaseTableHead>
          </template>
          
          <template #body>
            <tr 
              v-for="user in users" 
              :key="user.uuid" 
              class="border-t border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <BaseTableCell>
                <div class="flex items-center gap-3">
                  <div v-if="user.picture" class="w-8 h-8 rounded-full overflow-hidden">
                    <img :src="getImageUrl(user.picture)" :alt="user.name" class="w-full h-full object-cover" />
                  </div>
                  <div v-else class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                    <UserCircle class="w-5 h-5" />
                  </div>
                  <span class="font-medium text-gray-900">{{ user.name || $t('users.noName') }}</span>
                </div>
              </BaseTableCell>
              
              <BaseTableCell>
                {{ user.email }}
              </BaseTableCell>
              
              <BaseTableCell>
                <span 
                  :class="{
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium': true,
                    'bg-blue-100 text-blue-800': user.role === 'ADMIN',
                    'bg-green-100 text-green-800': user.role === 'AUTHOR'
                  }"
                >
                  {{ user.role === 'ADMIN' ? $t('users.admin') : $t('users.author') }}
                </span>
              </BaseTableCell>
              
              <BaseTableCell class="text-right">
                <div class="flex justify-end gap-2">
                  <button 
                    @click="router.push(`/user/edit/${user.uuid}`)" 
                    class="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                    :title="$t('users.editUser')"
                  >
                    <Edit class="w-4 h-4" />
                  </button>
                </div>
              </BaseTableCell>
            </tr>
          </template>
        </BaseTable>
      </div>
    </div>
  </ViewLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import ViewLayout from '@/views/ViewLayout.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseTable from '@/components/BaseTable.vue'
import BaseTableHead from '@/components/BaseTableHead.vue'
import BaseTableCell from '@/components/BaseTableCell.vue'
import { Plus, UserCircle, Edit } from 'lucide-vue-next'
import api from '@/utils/api'

const { t } = useI18n()
const router = useRouter()
const users = ref([])
const isLoading = ref(false)

const getImageUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${path}`
}

const fetchUsers = async () => {
  isLoading.value = true
  try {
    const response = await api.get('/api/users')
    users.value = response.data
  } catch (error) {
    console.error(t('users.loadError'), error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchUsers()
})
</script>