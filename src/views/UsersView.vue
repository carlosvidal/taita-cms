<template>
  <ViewLayout>
    <template #title>Usuarios</template>
    <template #subtitle>Gestiona los perfiles de usuario del blog</template>
    
    <div class="space-y-6">
      <!-- Cabecera con botón de crear usuario -->
      <div class="flex justify-between items-center">
        <div>
          <p v-if="users.length" class="text-gray-500 text-sm">
            {{ users.length }} {{ users.length === 1 ? 'usuario' : 'usuarios' }} encontrados
          </p>
        </div>
        
        <BaseButton 
          @click="router.push('/cms/users/new')" 
          variant="primary"
          class="flex items-center gap-2"
        >
          <Plus class="w-4 h-4" />
          <span>Nuevo Usuario</span>
        </BaseButton>
      </div>
      
      <!-- Indicador de carga -->
      <div v-if="isLoading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
      
      <!-- Mensaje si no hay usuarios -->
      <div v-else-if="!users.length" class="text-center py-12 bg-gray-50 rounded-md">
        <div class="text-gray-400 mb-3">
          <UserCircle class="w-12 h-12 mx-auto" />
        </div>
        <h3 class="text-lg font-medium text-gray-700 mb-1">No hay usuarios</h3>
        <p class="text-gray-500 text-sm mb-4">Comienza creando un nuevo usuario</p>
        <BaseButton 
          @click="router.push('/cms/users/new')" 
          variant="primary" 
          size="sm"
        >
          Crear Usuario
        </BaseButton>
      </div>
      
      <!-- Tabla de usuarios -->
      <div v-else class="overflow-hidden bg-white rounded-md border border-gray-200">
        <BaseTable>
          <template #header>
            <BaseTableHead>Nombre</BaseTableHead>
            <BaseTableHead>Email</BaseTableHead>
            <BaseTableHead>Rol</BaseTableHead>
            <BaseTableHead class="text-right">Acciones</BaseTableHead>
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
                  <span class="font-medium text-gray-900">{{ user.name || 'Sin nombre' }}</span>
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
                  {{ user.role === 'ADMIN' ? 'Administrador' : 'Autor' }}
                </span>
              </BaseTableCell>
              
              <BaseTableCell class="text-right">
                <div class="flex justify-end gap-2">
                  <button 
                    @click="router.push(`/user/edit/${user.uuid}`)" 
                    class="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                    title="Editar usuario"
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
import ViewLayout from '@/views/ViewLayout.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseTable from '@/components/BaseTable.vue'
import BaseTableHead from '@/components/BaseTableHead.vue'
import BaseTableCell from '@/components/BaseTableCell.vue'
import { Plus, UserCircle, Edit } from 'lucide-vue-next'
import api from '@/utils/api'

const router = useRouter()
const users = ref([])
const isLoading = ref(false)

// Función para obtener la URL completa de una imagen
const getImageUrl = (path) => {
  if (!path) return null
  
  // Si la ruta ya es una URL completa, devolverla
  if (path.startsWith('http')) return path
  
  // Si no, construir la URL completa
  return `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${path}`
}

// Cargar usuarios
const fetchUsers = async () => {
  isLoading.value = true
  try {
    const response = await api.get('/api/users')
    users.value = response.data
    console.log('Usuarios cargados:', users.value)
  } catch (error) {
    console.error('Error al cargar usuarios:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchUsers()
})
</script>
