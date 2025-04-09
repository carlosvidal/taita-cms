<script setup>
import { ref, watch } from 'vue'
import TipTapEditor from '@/components/TipTapEditor.vue'

const props = defineProps({
  post: {
    type: Object,
    default: null
  },
  categories: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['save', 'close'])

const formData = ref({
  title: '',
  content: '',
  slug: '',
  categoryId: '',
  image: '',
  thumbnail: ''
})

watch(() => props.post, (newVal) => {
  if (newVal) {
    formData.value = { 
      ...newVal,
      categoryId: newVal.category?.id || ''
    }
  } else {
    formData.value = { 
      title: '',
      content: '',
      slug: '',
      categoryId: '',
      image: '',
      thumbnail: ''
    }
  }
}, { immediate: true })

const handleSubmit = () => {
  emit('save', formData.value)
}
</script>

<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <h2>{{ post ? 'Edit' : 'Add' }} Post</h2>
      <form @submit.prevent="handleSubmit">
        <div>
          <label>Title:</label>
          <input v-model="formData.title" required />
        </div>
        <div>
          <label>Content:</label>
          <TipTapEditor v-model="formData.content" />
        </div>
        <div>
          <label>Slug:</label>
          <input v-model="formData.slug" required />
        </div>
        <div>
          <label>Category:</label>
          <select v-model="formData.categoryId" required>
            <option value="">Select a category</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>
        <div>
          <label>Image URL:</label>
          <input v-model="formData.image" />
        </div>
        <div>
          <label>Thumbnail URL:</label>
          <input v-model="formData.thumbnail" />
        </div>
        <div class="modal-actions">
          <button type="submit">Save</button>
          <button type="button" @click="$emit('close')">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

textarea {
  width: 100%;
  min-height: 150px;
}
</style>