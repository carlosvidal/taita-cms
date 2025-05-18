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
        // Obtener el blog activo
        const activeBlogUuid = localStorage.getItem('activeBlog');
        if (!activeBlogUuid) {
          console.error('No hay un blog activo seleccionado');
          return;
        }
        
        // Obtener el ID del blog
        const blogResponse = await api.get(`/api/blogs/uuid/${activeBlogUuid}`);
        const blogId = blogResponse.data?.id;
        
        if (!blogId) {
          console.error('No se pudo obtener el ID del blog activo');
          return;
        }
        
        // Obtener los posts del blog activo
        const response = await api.get(`/api/posts?blogId=${blogId}&includeDrafts=true`);
        this.posts = response.data;
      } catch (error) {
        console.error('Error fetching posts:', error);
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