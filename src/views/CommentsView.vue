<template>
  <ViewLayout title="Moderación de Comentarios">
    <div class="comments-toolbar">
      <label>
        Estado:
        <select v-model="filterStatus">
          <option value="">Todos</option>
          <option value="PENDING">Pendiente</option>
          <option value="APPROVED">Aprobado</option>
          <option value="REJECTED">Rechazado</option>
          <option value="SPAM">Spam</option>
        </select>
      </label>
      <button @click="fetchComments" class="btn btn-primary">Actualizar</button>
    </div>
    <table class="comments-table">
      <thead>
        <tr>
          <th>Autor</th>
          <th>Email</th>
          <th>Comentario</th>
          <th>Post</th>
          <th>Fecha</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="comment in filteredComments" :key="comment.uuid">
          <td>{{ comment.authorName }}</td>
          <td>{{ comment.authorEmail }}</td>
          <td>{{ comment.content }}</td>
          <td>{{ comment.post?.title || '-' }}</td>
          <td>{{ formatDate(comment.createdAt) }}</td>
          <td>
            <span :class="'status-' + comment.status.toLowerCase()">{{ statusLabel(comment.status) }}</span>
          </td>
          <td>
            <button v-if="comment.status === 'PENDING' || comment.status === 'REJECTED'"
              @click="approveComment(comment)" class="icon-action" title="Aprobar">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
            <button v-if="comment.status === 'PENDING' || comment.status === 'APPROVED'"
              @click="rejectComment(comment)" class="icon-action" title="Rechazar">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <button v-if="comment.status !== 'SPAM'" @click="spamComment(comment)" class="icon-action" title="Marcar como spam">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 22 21 22 12 2 3 22"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="20" x2="12" y2="20"/></svg>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="loading" class="comments-loading">Cargando comentarios...</div>
    <div v-if="error" class="comments-error">{{ error }}</div>
    <div v-if="!loading && filteredComments.length === 0" class="comments-empty">No hay comentarios.</div>
  </ViewLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import ViewLayout from './ViewLayout.vue';

const comments = ref([]);
const loading = ref(false);
const error = ref('');
const filterStatus = ref('PENDING');

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString();
}

function statusLabel(status) {
  switch (status) {
    case 'PENDING': return 'Pendiente';
    case 'APPROVED': return 'Aprobado';
    case 'REJECTED': return 'Rechazado';
    case 'SPAM': return 'Spam';
    default: return status;
  }
}

const filteredComments = computed(() => {
  if (!filterStatus.value) return comments.value;
  return comments.value.filter(c => c.status === filterStatus.value);
});

async function fetchComments() {
  loading.value = true;
  error.value = '';
  try {
    const res = await fetch('/api/comments?status=' + (filterStatus.value || ''));
    if (!res.ok) throw new Error('No se pudieron cargar los comentarios');
    const data = await res.json();
    // Si la API no incluye el post, puedes hacer un join en el backend o fetch extra aquí
    comments.value = data;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

async function approveComment(comment) {
  if (!confirm('¿Aprobar este comentario?')) return;
  loading.value = true;
  try {
    const res = await fetch(`/api/comments/${comment.uuid}/approve`, { method: 'PATCH' });
    if (!res.ok) throw new Error('No se pudo aprobar el comentario');
    comment.status = 'APPROVED';
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

async function rejectComment(comment) {
  if (!confirm('¿Rechazar este comentario?')) return;
  loading.value = true;
  try {
    const res = await fetch(`/api/comments/${comment.uuid}/reject`, { method: 'PATCH' });
    if (!res.ok) throw new Error('No se pudo rechazar el comentario');
    comment.status = 'REJECTED';
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

async function spamComment(comment) {
  if (!confirm('¿Marcar este comentario como spam?')) return;
  loading.value = true;
  try {
    const res = await fetch(`/api/comments/${comment.uuid}/spam`, { method: 'PATCH' });
    if (!res.ok) throw new Error('No se pudo marcar como spam');
    comment.status = 'SPAM';
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

onMounted(fetchComments);
</script>

<style scoped>
.comments-toolbar {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}
.comments-table {
  width: 100%;
  border-collapse: collapse;
}
.comments-table th, .comments-table td {
  border: 1px solid #eee;
  padding: 0.5rem 0.75rem;
  text-align: left;
}
.status-pending { color: #f39c12; font-weight: bold; }
.status-approved { color: #27ae60; font-weight: bold; }
.status-rejected { color: #c0392b; font-weight: bold; }
.status-spam { color: #8e44ad; font-weight: bold; }
.comments-loading, .comments-empty, .comments-error {
  margin-top: 1rem;
  text-align: center;
  color: #888;
}
.btn-xs {
  font-size: 0.85em;
  padding: 0.25em 0.75em;
  margin-right: 0.25em;
}
.icon-action {
  background: none;
  border: none;
  padding: 0.2em 0.4em;
  margin-right: 0.2em;
  cursor: pointer;
  color: #555;
  transition: color 0.2s;
}
.icon-action:hover {
  color: #007bff;
}
.icon-action:focus {
  outline: 2px solid #007bff;
}

</style>
