<template>
  <div class="blogs-view">
    <h1>Blogs</h1>
    <form @submit.prevent="createBlog" class="blog-form">
      <input v-model="form.name" placeholder="Nombre del blog" required />
      <input v-model="form.subdomain" placeholder="Subdominio" required />
      <input v-model="form.domain" placeholder="Dominio personalizado (opcional)" />
      <select v-model="form.plan">
        <option value="FREE">Free</option>
        <option value="PRO">Pro</option>
      </select>
      <button type="submit">Crear blog</button>
      <span v-if="error" class="error">{{ error }}</span>
    </form>
    <hr />
    <h2>Listado de blogs</h2>
    <ul v-if="blogs.length">
      <li v-for="blog in blogs" :key="blog.id">
        <strong>{{ blog.name }}</strong>
        <span v-if="blog.subdomain">({{ blog.subdomain }}.tudominio.com)</span>
        <span v-if="blog.domain">[{{ blog.domain }}]</span>
        <span class="plan">{{ blog.plan }}</span>
      </li>
    </ul>
    <p v-else>No tienes blogs creados.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const blogs = ref([])
const error = ref('')
const form = ref({
  name: '',
  subdomain: '',
  domain: '',
  plan: 'FREE',
})

async function fetchBlogs() {
  try {
    const res = await axios.get('/api/blogs', { withCredentials: true })
    blogs.value = res.data
  } catch (e) {
    error.value = 'Error al cargar blogs'
  }
}

async function createBlog() {
  error.value = ''
  try {
    await axios.post('/api/blogs', {
      ...form.value,
      domain: form.value.domain || null,
    }, { withCredentials: true })
    form.value = { name: '', subdomain: '', domain: '', plan: 'FREE' }
    await fetchBlogs()
  } catch (e) {
    error.value = e.response?.data?.error || 'Error al crear blog'
  }
}

onMounted(fetchBlogs)
</script>

<style scoped>
.blogs-view {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
}
.blog-form {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}
.blog-form input,
.blog-form select {
  flex: 1 1 180px;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.blog-form button {
  padding: 0.5rem 1.5rem;
  background: #1a73e8;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.error {
  color: #c00;
  margin-left: 1rem;
}
ul {
  list-style: none;
  padding: 0;
}
li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}
.plan {
  margin-left: 1rem;
  font-size: 0.9em;
  color: #888;
}
</style>
