<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ViewLayout from '@/views/ViewLayout.vue'
import BaseButton from '@/components/BaseButton.vue'
import api from '@/utils/api'
import { useBlog } from '@/composables/useBlog'
import { Key, Plus, Trash2, Copy, Check, ExternalLink, ToggleLeft, ToggleRight } from 'lucide-vue-next'

const { t } = useI18n()
const { getCurrentBlogId } = useBlog()

const apiKeys = ref([])
const isLoading = ref(false)
const error = ref('')
const showCreateForm = ref(false)
const newKeyName = ref('')
const createdKey = ref(null) // Full key shown only once after creation
const copiedField = ref('')

const fetchApiKeys = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const response = await api.get('/api/api-keys')
    apiKeys.value = response.data.data || response.data
  } catch (err) {
    error.value = err.response?.data?.message || err.response?.data?.error || 'Error loading API keys'
    console.error('[ApiKeysView] Error:', err.response?.data)
  } finally {
    isLoading.value = false
  }
}

const handleCreate = async () => {
  if (!newKeyName.value.trim()) return
  error.value = ''
  try {
    const response = await api.post('/api/api-keys', {
      name: newKeyName.value.trim()
    })
    createdKey.value = response.data
    newKeyName.value = ''
    showCreateForm.value = false
    await fetchApiKeys()
  } catch (err) {
    error.value = err.response?.data?.message || err.response?.data?.error || 'Error creating API key'
  }
}

const handleToggle = async (key) => {
  try {
    await api.patch(`/api/api-keys/${key.uuid}`, { active: !key.active })
    await fetchApiKeys()
  } catch (err) {
    error.value = err.response?.data?.error || 'Error updating API key'
  }
}

const handleDelete = async (key) => {
  if (!confirm(`Are you sure you want to revoke "${key.name}"? This cannot be undone.`)) return
  try {
    await api.delete(`/api/api-keys/${key.uuid}`)
    await fetchApiKeys()
  } catch (err) {
    error.value = err.response?.data?.error || 'Error deleting API key'
  }
}

const copyToClipboard = async (text, field) => {
  await navigator.clipboard.writeText(text)
  copiedField.value = field
  setTimeout(() => { copiedField.value = '' }, 2000)
}

const dismissCreatedKey = () => {
  createdKey.value = null
}

const mcpConfig = (key) => JSON.stringify({
  mcpServers: {
    taita: {
      command: "node",
      args: ["/path/to/taita-mcp-server/index.js"],
      env: {
        TAITA_API_KEY: key,
        TAITA_API_URL: "https://backend.taita.blog/api/v1"
      }
    }
  }
}, null, 2)

const curlExample = (key) => `curl -X POST https://backend.taita.blog/api/v1/posts \\
  -H "X-API-Key: ${key}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "My Post",
    "content": "<p>Hello world</p>",
    "status": "published"
  }'`

onMounted(fetchApiKeys)
</script>

<template>
  <ViewLayout>
    <template #title>API Keys</template>
    <template #subtitle>Manage API keys for external integrations and AI agents</template>

    <div class="api-keys-container">
      <!-- Error banner -->
      <div v-if="error" class="error-banner">
        {{ error }}
        <button @click="error = ''" class="dismiss-btn">&times;</button>
      </div>

      <!-- Created key alert (shown only once) -->
      <div v-if="createdKey" class="created-key-alert">
        <div class="alert-header">
          <Key class="w-5 h-5" />
          <strong>API Key Created — Save it now!</strong>
        </div>
        <p class="alert-warning">This key will only be shown once. Copy it before closing.</p>

        <div class="key-display">
          <code>{{ createdKey.key }}</code>
          <button @click="copyToClipboard(createdKey.key, 'created-key')" class="copy-btn">
            <Check v-if="copiedField === 'created-key'" class="w-4 h-4 text-green-500" />
            <Copy v-else class="w-4 h-4" />
          </button>
        </div>

        <!-- MCP Config -->
        <details class="config-details">
          <summary>MCP Config (Claude Desktop / Claude Code)</summary>
          <div class="config-block">
            <pre>{{ mcpConfig(createdKey.key) }}</pre>
            <button @click="copyToClipboard(mcpConfig(createdKey.key), 'mcp-config')" class="copy-btn overlay">
              <Check v-if="copiedField === 'mcp-config'" class="w-4 h-4 text-green-500" />
              <Copy v-else class="w-4 h-4" />
            </button>
          </div>
        </details>

        <!-- Curl example -->
        <details class="config-details">
          <summary>cURL Example</summary>
          <div class="config-block">
            <pre>{{ curlExample(createdKey.key) }}</pre>
            <button @click="copyToClipboard(curlExample(createdKey.key), 'curl')" class="copy-btn overlay">
              <Check v-if="copiedField === 'curl'" class="w-4 h-4 text-green-500" />
              <Copy v-else class="w-4 h-4" />
            </button>
          </div>
        </details>

        <div class="alert-actions">
          <a href="https://github.com/carlosvidal/taita-mcp-server" target="_blank" class="github-link">
            <ExternalLink class="w-4 h-4" />
            Download MCP Server from GitHub
          </a>
          <button @click="dismissCreatedKey" class="dismiss-alert-btn">I've saved the key</button>
        </div>
      </div>

      <!-- Header with create button -->
      <div class="section-header">
        <h3>Your API Keys</h3>
        <BaseButton variant="primary" size="sm" @click="showCreateForm = true">
          <template #icon><Plus class="w-4 h-4" /></template>
          New API Key
        </BaseButton>
      </div>

      <!-- Create form -->
      <div v-if="showCreateForm" class="create-form">
        <input
          v-model="newKeyName"
          type="text"
          placeholder="Key name (e.g. Claude Agent, Zapier, n8n)"
          class="name-input"
          @keyup.enter="handleCreate"
        />
        <div class="form-actions">
          <BaseButton variant="primary" size="sm" @click="handleCreate" :disabled="!newKeyName.trim()">
            Create
          </BaseButton>
          <BaseButton variant="ghost" size="sm" @click="showCreateForm = false; newKeyName = ''">
            Cancel
          </BaseButton>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="loading-state">
        Loading API keys...
      </div>

      <!-- Empty state -->
      <div v-else-if="apiKeys.length === 0" class="empty-state">
        <Key class="empty-icon" />
        <h4>No API keys yet</h4>
        <p>Create an API key to allow AI agents and external tools to publish posts on your blog.</p>
      </div>

      <!-- Keys list -->
      <div v-else class="keys-list">
        <div v-for="key in apiKeys" :key="key.uuid" class="key-card" :class="{ inactive: !key.active }">
          <div class="key-info">
            <div class="key-name">
              <Key class="w-4 h-4" />
              <strong>{{ key.name }}</strong>
              <span v-if="!key.active" class="badge badge-inactive">Disabled</span>
              <span v-else class="badge badge-active">Active</span>
            </div>
            <div class="key-meta">
              <code class="key-masked">{{ key.key }}</code>
              <span v-if="key.lastUsedAt" class="last-used">
                Last used: {{ new Date(key.lastUsedAt).toLocaleDateString() }}
              </span>
              <span v-else class="last-used">Never used</span>
              <span class="created-at">
                Created: {{ new Date(key.createdAt).toLocaleDateString() }}
              </span>
            </div>
          </div>
          <div class="key-actions">
            <button @click="handleToggle(key)" class="action-btn" :title="key.active ? 'Disable' : 'Enable'">
              <ToggleRight v-if="key.active" class="w-5 h-5 text-green-500" />
              <ToggleLeft v-else class="w-5 h-5 text-gray-400" />
            </button>
            <button @click="handleDelete(key)" class="action-btn danger" title="Revoke">
              <Trash2 class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Info section -->
      <div class="info-section">
        <h4>How to use API Keys</h4>
        <div class="info-grid">
          <div class="info-card">
            <h5>REST API</h5>
            <p>Use the <code>X-API-Key</code> header to authenticate requests to <code>/api/v1/posts</code></p>
          </div>
          <div class="info-card">
            <h5>MCP Server</h5>
            <p>Connect Claude Desktop or Claude Code to your blog.
              <a href="https://github.com/carlosvidal/taita-mcp-server" target="_blank">
                Download from GitHub <ExternalLink class="w-3 h-3 inline" />
              </a>
            </p>
          </div>
          <div class="info-card">
            <h5>Automation</h5>
            <p>Use with n8n, Zapier, Make, or any tool that supports REST APIs.</p>
          </div>
        </div>
      </div>
    </div>
  </ViewLayout>
</template>

<style scoped>
.api-keys-container {
  max-width: 800px;
}

.error-banner {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dismiss-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #991b1b;
}

.created-key-alert {
  background: #f0fdf4;
  border: 2px solid #86efac;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.alert-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: #166534;
}

.alert-warning {
  color: #166534;
  font-size: 14px;
  margin-bottom: 12px;
}

.key-display {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  font-family: monospace;
  word-break: break-all;
}

.key-display code {
  flex: 1;
  font-size: 14px;
}

.copy-btn {
  background: none;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.copy-btn:hover {
  background: #f3f4f6;
}

.copy-btn.overlay {
  position: absolute;
  top: 8px;
  right: 8px;
}

.config-details {
  margin-bottom: 8px;
}

.config-details summary {
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  padding: 8px 0;
}

.config-block {
  position: relative;
  background: #1f2937;
  color: #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;
}

.config-block pre {
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
  white-space: pre-wrap;
}

.alert-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
}

.github-link {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #4f46e5;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
}

.github-link:hover {
  text-decoration: underline;
}

.dismiss-alert-btn {
  background: #166534;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
}

.dismiss-alert-btn:hover {
  background: #15803d;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  font-size: 16px;
  font-weight: 600;
}

.create-form {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.name-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 12px;
}

.name-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-actions {
  display: flex;
  gap: 8px;
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: #6b7280;
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: #6b7280;
}

.empty-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  opacity: 0.3;
}

.empty-state h4 {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.keys-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
}

.key-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
}

.key-card.inactive {
  opacity: 0.6;
}

.key-info {
  flex: 1;
}

.key-name {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.badge-active {
  background: #dcfce7;
  color: #166534;
}

.badge-inactive {
  background: #f3f4f6;
  color: #6b7280;
}

.key-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #6b7280;
  flex-wrap: wrap;
}

.key-masked {
  font-family: monospace;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.key-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  border-radius: 6px;
}

.action-btn:hover {
  background: #f3f4f6;
}

.action-btn.danger:hover {
  background: #fef2f2;
  color: #dc2626;
}

.info-section {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.info-section h4 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.info-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
}

.info-card h5 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 6px;
}

.info-card p {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
}

.info-card code {
  background: #e5e7eb;
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 12px;
}

.info-card a {
  color: #4f46e5;
  text-decoration: none;
}

.info-card a:hover {
  text-decoration: underline;
}
</style>
