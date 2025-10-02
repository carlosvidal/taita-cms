<template>
  <ViewLayout>
    <template #title>{{ $t('comments.title') }}</template>
    <template #subtitle>{{ $t('comments.subtitle') }}</template>

    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
      <div class="flex items-center gap-2">
        <label class="text-panel-text font-medium">{{ $t('common.status') }}:</label>
        <select v-model="filterStatus" class="border-panel rounded px-2 py-1 bg-panel text-panel-text">
          <option value="">{{ $t('comments.all') }}</option>
          <option value="PENDING">{{ $t('comments.pending') }}</option>
          <option value="APPROVED">{{ $t('comments.approved') }}</option>
          <option value="REJECTED">{{ $t('comments.rejected') }}</option>
          <option value="SPAM">{{ $t('comments.spam') }}</option>
        </select>
      </div>
      <BaseButton @click="fetchComments" variant="primary" size="sm">{{ $t('common.update') }}</BaseButton>
    </div>

    <div class="overflow-x-auto bg-panel border border-panel rounded-lg shadow-sm">
      <table class="min-w-full divide-y border-panel">
        <thead class="bg-panel">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-panel-muted uppercase tracking-wider">{{ $t('common.author') }}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-panel-muted uppercase tracking-wider">{{ $t('common.email') }}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-panel-muted uppercase tracking-wider">{{ $t('comments.comment') }}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-panel-muted uppercase tracking-wider">{{ $t('comments.post') }}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-panel-muted uppercase tracking-wider">{{ $t('common.date') }}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-panel-muted uppercase tracking-wider">{{ $t('common.status') }}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-panel-muted uppercase tracking-wider">{{ $t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody class="bg-panel divide-y border-panel">
          <tr v-for="comment in filteredComments" :key="comment.uuid" class="hover:bg-panel transition-colors duration-150">
            <td class="px-6 py-4 whitespace-nowrap">{{ comment.authorName }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ comment.authorEmail }}</td>
            <td class="px-6 py-4">{{ comment.content }}</td>
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
                :title="$t('comments.approve')"
              >
                <Check class="w-5 h-5" />
              </button>
              <button v-if="comment.status === 'PENDING' || comment.status === 'APPROVED'"
                @click="rejectComment(comment)"
                class="icon-action"
                :title="$t('comments.reject')"
              >
                <X class="w-5 h-5" />
              </button>
              <button v-if="comment.status !== 'SPAM'"
                @click="spamComment(comment)"
                class="icon-action"
                :title="$t('comments.markAsSpam')"
              >
                <ShieldOff class="w-5 h-5" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="loading" class="text-panel-muted text-center py-6">{{ $t('comments.loading') }}</div>
    <div v-if="error" class="text-red-600 text-center py-6">{{ error }}</div>
    <div v-if="!loading && filteredComments.length === 0" class="text-panel-muted text-center py-6">{{ $t('comments.noComments') }}</div>
  </ViewLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import ViewLayout from './ViewLayout.vue';
import BaseButton from '@/components/BaseButton.vue';
import { Check, X, ShieldOff } from 'lucide-vue-next';
import api from '@/utils/api';

const { t } = useI18n();
const comments = ref([]);
const loading = ref(false);
const error = ref('');
const filterStatus = ref('PENDING');

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString();
}

function statusLabel(status) {
  switch (status) {
    case 'PENDING': return t('comments.pending');
    case 'APPROVED': return t('comments.approved');
    case 'REJECTED': return t('comments.rejected');
    case 'SPAM': return t('comments.spam');
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
    const response = await api.get('/api/comments', {
      params: {
        status: filterStatus.value || ''
      }
    });
    comments.value = response.data;
  } catch (err) {
    console.error('Error al cargar comentarios:', err);
    error.value = err.response?.data?.error || t('comments.loadError');
  } finally {
    loading.value = false;
  }
}

async function approveComment(comment) {
  if (!confirm(t('comments.approveConfirm'))) return;
  loading.value = true;
  try {
    await api.patch(`/api/comments/${comment.uuid}/approve`);
    comment.status = 'APPROVED';
  } catch (err) {
    console.error('Error al aprobar comentario:', err);
    error.value = err.response?.data?.error || t('comments.approveError');
  } finally {
    loading.value = false;
  }
}

async function rejectComment(comment) {
  if (!confirm(t('comments.rejectConfirm'))) return;
  loading.value = true;
  try {
    await api.patch(`/api/comments/${comment.uuid}/reject`);
    comment.status = 'REJECTED';
  } catch (err) {
    console.error('Error al rechazar comentario:', err);
    error.value = err.response?.data?.error || t('comments.rejectError');
  } finally {
    loading.value = false;
  }
}

async function spamComment(comment) {
  if (!confirm(t('comments.spamConfirm'))) return;
  loading.value = true;
  try {
    await api.patch(`/api/comments/${comment.uuid}/spam`);
    comment.status = 'SPAM';
  } catch (err) {
    console.error('Error al marcar como spam:', err);
    error.value = err.response?.data?.error || t('comments.spamError');
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