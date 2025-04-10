<template>
  <form @submit.prevent="handleSubmit">
    <div>
      <label>Status</label>
      <select v-model="post.status">
        <option value="draft">Borrador</option>
        <option value="published">Publicado</option>
      </select>
    </div>
    
    <button type="submit" class="btn btn-primary">
      {{ post.id ? 'Actualizar' : 'Crear' }}
    </button>
  </form>
</template>

<script>
export default {
  data() {
    return {
      post: {
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }
  },
  methods: {
    async handleSubmit() {
      if (this.post.status === 'published') {
        this.post.publishedAt = new Date();
      }
      // ... rest of your submit logic
    }
  }
}
</script>