<template>
  <ViewLayout>
    <template #title>Comentarios</template>
    <template #subtitle>Modera los comentarios de tus posts</template>

    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
      <div class="flex items-center gap-2">
        <label class="text-panel-text font-medium">Estado:</label>
        <select v-model="filterStatus" class="border-panel rounded px-2 py-1 bg-panel text-panel-text">
          <option value="">Todos</option>
          <option value="PENDING">Pendiente</option>
          <option value="APPROVED">Aprobado</option>
          <option value="REJECTED">Rechazado</option>
          <option value="SPAM">Spam</option>
        </select>
      </div>
      <BaseButton @click="fetchComments" variant="primary" size="sm">Actualizar</BaseButton>
    </div>

    <div class="overflow-x-auto bg-panel border border-panel rounded-lg shadow-sm">
      <table class="min-w-full divide-y border-panel">
        <thead class="bg-panel">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-panel-muted uppercase tracking-wider">Autor</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-panel-muted uppercase tracking-wider">Email</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-panel-muted uppercase tracking-wider">Comentario</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-panel-muted uppercase tracking-wider">Post</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-panel-muted uppercase tracking-wider">Fecha</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-panel-muted uppercase tracking-wider">Estado</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-panel-muted uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-panel divide-y border-panel">
          <tr v-for="comment in filteredComments" :key="comment.uuid" class="hover:bg-panel transition-colors duration-150">
            <td class="px-6 py-4 whitespace-nowrap">{{ comment.authorName }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ comment.authorEmail }}</td>
            <td class="px-6 py-4">{{ comment.content }}</td>
            <!-- Si comment.post es un objeto, mostrar el título; si es un ID/UUID o no viene, mostrar placeholder -->
            <td class="px-6 py-4">
              <span v-if="typeof comment.post === 'object' && comment.post && comment.post.title">{{ comment.post.title }}</span>
              <span v-else-if="comment.post">({{ comment.post }})</span>
              <span v-else>-</span>
            </td>
            <td class="px-6 py-4">{{ formatDate(comment.createdAt) }}</td>
            <td class="px-6 py-4">
              <span :class="'status-' + comment.status.toLowerCase()">{{ statusLabel(comment.status) }}</span>
            </td>
            <td class="px-6 py-4 flex gap-2">
              <button v-if="comment.status === 'PENDING' || comment.status === 'REJECTED'"
                @click="approveComment(comment)"
                class="icon-action"
                title="Aprobar"
              >
                <Check class="w-5 h-5" />
              </button>
              <button v-if="comment.status === 'PENDING' || comment.status === 'APPROVED'"
                @click="rejectComment(comment)"
                class="icon-action"
                title="Rechazar"
              >
                <X class="w-5 h-5" />
              </button>
              <button v-if="comment.status !== 'SPAM'"
                @click="spamComment(comment)"
                class="icon-action"
                title="Marcar como spam"
              >
                <ShieldOff class="w-5 h-5" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="loading" class="text-panel-muted text-center py-6">Cargando comentarios...</div>
    <div v-if="error" class="text-red-600 text-center py-6">{{ error }}</div>
    <div v-if="!loading && filteredComments.length === 0" class="text-panel-muted text-center py-6">No hay comentarios.</div>
  </ViewLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import ViewLayout from './ViewLayout.vue';
import BaseButton from '@/components/BaseButton.vue';
import { Check, X, ShieldOff } from 'lucide-vue-next';

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
