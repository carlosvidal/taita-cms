<template>
  <div>
    <table class="table">
      <thead>
        <tr>
          <th>Título</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="post in posts" :key="post.id">
          <td>{{ post.title }}</td>
          <td>
            <span class="badge" :class="{
              'badge-secondary': post.status === 'draft',
              'badge-success': post.status === 'published'
            }">
              {{ post.status === 'published' ? 'Publicado' : 'Borrador' }}
            </span>
          </td>
          <td>
            <BaseButton 
              @click="togglePostStatus(post)"
              variant="primary"
              size="sm"
              :disabled="isSaving"
            >
              {{ post.status === 'published' ? 'Despublicar' : 'Publicar' }}
            </BaseButton>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import BaseButton from '@/components/BaseButton.vue'
import api from '@/utils/api'

export default {
  components: { BaseButton },
  data() {
    return {
      isSaving: false,
      posts: []
    }
  },
  mounted() {
    this.fetchPosts();
  },
  methods: {
    async togglePostStatus(post) {
      try {
        const apiUrl = 'https://taita-api.onrender.com'; // URL completa de la API
        const newStatus = post.status === 'published' ? 'draft' : 'published';
        
        // Primero obtenemos el ID numérico del post a partir del UUID
        console.log(`Obteniendo ID numérico del post con UUID: ${post.uuid}`);
        
        // Obtener el post actual para obtener su ID numérico
        const getResponse = await fetch(`${apiUrl}/api/posts/uuid/${post.uuid}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        
        if (!getResponse.ok) {
          throw new Error('No se pudo obtener el post');
        }
        
        const postData = await getResponse.json();
        const postId = postData.id;
        
        if (!postId) {
          throw new Error('No se pudo obtener el ID numérico del post');
        }
        
        console.log(`ID numérico del post obtenido: ${postId}`);
        console.log(`Enviando PATCH a /api/posts/${postId}`);
        
        // Ahora sí actualizamos el estado del post usando el ID numérico
        const response = await fetch(`${apiUrl}/api/posts/${postId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({ status: newStatus.toUpperCase() })
        });
        
        if (!response.ok) throw new Error('Update failed');
        this.fetchPosts();
      } catch (error) {
        console.error('Error toggling status:', error);
      }
    }
    async fetchPosts() {
      try {
        console.log('Starting fetchPosts...');
        const activeBlogUuid = localStorage.getItem('activeBlog');
        console.log('Active blog UUID from localStorage:', activeBlogUuid);
        
        if (!activeBlogUuid) {
          console.error('No hay un blog activo seleccionado');
          return;
        }
    
        console.log('Fetching blog details for UUID:', activeBlogUuid);
        const blogResponse = await api.get(`/api/blogs/uuid/${activeBlogUuid}`);
        console.log('Blog response:', blogResponse.data);
        
        const blogId = blogResponse.data?.id;
        console.log('Extracted blog ID:', blogId);
        
        if (!blogId) {
          console.error('No se pudo obtener el ID del blog activo');
          return;
        }
    
        console.log('Fetching posts for blog ID:', blogId);
        const response = await api.get('/api/posts', {
          params: {
            blogId: blogId,
            includeDrafts: true
          }
        });
        
        console.log('Posts API response:', response);
        this.posts = response.data;
        console.log('Posts set in component:', this.posts);
      } catch (error) {
        console.error('Error in fetchPosts:', {
          message: error.message,
          response: error.response?.data,
          config: error.config
        });
      }
    }
  }
}
</script>

<style scoped>
.badge {
  padding: 0.35em 0.65em;
  font-size: 0.875em;
  font-weight: 500;
  border-radius: 0.25rem;
}
.badge-secondary {
  background-color: #6c757d;
  color: white;
}
.badge-success {
  background-color: #28a745;
  color: white;
}
</style>