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
        <tr v-for="page in pages" :key="page.id">
          <td>{{ page.title }}</td>
          <td>
            <span class="status-badge" :class="page.status">
              {{ page.status === 'published' ? 'Publicado' : 'Borrador' }}
            </span>
          </td>
          <td>
            <BaseButton 
              @click="togglePageStatus(page)"
              variant="primary"
              size="sm"
              :disabled="isSaving"
              :title="page.status === 'published' ? 'Despublicar' : 'Publicar'"
            >
              <span class="toggle-icon"></span>
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
  data() {
    return {
      pages: []
    }
  },
  components: { BaseButton },
  data() {
    return {
      isSaving: false
    }
  },
  methods: {
    async togglePageStatus(page) {
      try {
        const newStatus = page.status === 'published' ? 'draft' : 'published';
        const response = await fetch(`/api/pages/${page.uuid}`, {  // Changed from id to uuid
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: newStatus })
        });
        
        if (!response.ok) throw new Error('Update failed');
        this.fetchPages();
      } catch (error) {
        console.error('Error toggling status:', error);
      }
    },
    async fetchPages() {
      try {
        const response = await fetch('/api/pages?includeDrafts=true');
        this.pages = await response.json();
      } catch (error) {
        console.error('Error fetching pages:', error);
      }
    }
  }
}
</script>

<style scoped>
.status-badge {
  display: inline-block;
  padding: 0.35em 0.65em;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.875rem;
}

.status-badge.published {
  background-color: #e6f7ee;
  color: #28a745;
}

.status-badge.draft {
  background-color: #f8f9fa;
  color: #6c757d;
}

.status-toggle {
  width: 44px;
  height: 24px;
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  border: none;
  outline: none;
  transition: all 0.3s ease;
}

.status-toggle.published {
  background-color: #28a745;
}

.status-toggle.draft {
  background-color: #6c757d;
}

.toggle-icon {
  position: absolute;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: all 0.3s ease;
}

.status-toggle.published .toggle-icon {
  left: calc(100% - 22px);
}
</style>