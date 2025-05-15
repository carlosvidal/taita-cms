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

export default {
  components: { BaseButton },
  data() {
    return {
      isSaving: false
    }
  },
  methods: {
    ,async togglePostStatus(post) {
      try {
        const apiUrl = 'https://taita-api.onrender.com'; // URL completa de la API
        const newStatus = post.status === 'published' ? 'draft' : 'published';
        const response = await fetch(`${apiUrl}/api/posts/uuid/${post.uuid}`, {
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
        const response = await fetch('/api/posts?includeDrafts=true');
        this.posts = await response.json();
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