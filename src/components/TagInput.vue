<script setup>
import { ref, watch, computed } from 'vue'
import { X, Tag as TagIcon } from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  existingTags: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const inputValue = ref('')
const tags = ref([...props.modelValue])
const showSuggestions = ref(false)

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  tags.value = [...newValue]
}, { deep: true })

// Computed suggestions based on input
const suggestions = computed(() => {
  if (!inputValue.value.trim()) return []

  const input = inputValue.value.toLowerCase().trim()
  return props.existingTags
    .filter(tag =>
      tag.name.toLowerCase().includes(input) &&
      !tags.value.some(t => t.toLowerCase() === tag.name.toLowerCase())
    )
    .slice(0, 5)
})

const addTag = (tagName) => {
  const trimmedTag = tagName.trim()

  if (!trimmedTag) return

  // Prevent duplicates (case insensitive)
  const isDuplicate = tags.value.some(
    tag => tag.toLowerCase() === trimmedTag.toLowerCase()
  )

  if (isDuplicate) {
    inputValue.value = ''
    return
  }

  tags.value.push(trimmedTag)
  emit('update:modelValue', tags.value)
  inputValue.value = ''
  showSuggestions.value = false
}

const removeTag = (index) => {
  tags.value.splice(index, 1)
  emit('update:modelValue', tags.value)
}

const handleInput = (event) => {
  const value = event.target.value

  // Check if user typed a comma or semicolon
  if (value.includes(',') || value.includes(';')) {
    // Split by comma or semicolon and add all tags
    const newTags = value.split(/[,;]/)

    newTags.forEach(tag => {
      const trimmedTag = tag.trim()
      if (trimmedTag) {
        addTag(trimmedTag)
      }
    })

    inputValue.value = ''
    return
  }

  inputValue.value = value
  showSuggestions.value = value.trim().length > 0 && suggestions.value.length > 0
}

const handleKeydown = (event) => {
  // Enter key
  if (event.key === 'Enter') {
    event.preventDefault()
    if (inputValue.value.trim()) {
      addTag(inputValue.value)
    }
  }

  // Backspace on empty input removes last tag
  if (event.key === 'Backspace' && !inputValue.value && tags.value.length > 0) {
    removeTag(tags.value.length - 1)
  }
}

const selectSuggestion = (suggestion) => {
  addTag(suggestion.name)
  showSuggestions.value = false
}

const handleBlur = () => {
  // Delay hiding suggestions to allow click event to fire
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

const handleFocus = () => {
  if (inputValue.value.trim() && suggestions.value.length > 0) {
    showSuggestions.value = true
  }
}
</script>

<template>
  <div class="tag-input-container">
    <div class="tag-input-wrapper">
      <!-- Display tags as pills -->
      <div class="tags-list">
        <span
          v-for="(tag, index) in tags"
          :key="index"
          class="tag-pill"
        >
          <TagIcon class="w-3 h-3" />
          {{ tag }}
          <button
            type="button"
            @click="removeTag(index)"
            class="tag-remove-btn"
            :aria-label="`Remove ${tag}`"
          >
            <X class="w-3 h-3" />
          </button>
        </span>

        <!-- Input for new tags -->
        <input
          v-model="inputValue"
          @input="handleInput"
          @keydown="handleKeydown"
          @blur="handleBlur"
          @focus="handleFocus"
          type="text"
          placeholder="Escribe y presiona Enter o coma..."
          class="tag-input"
        />
      </div>

      <!-- Suggestions dropdown -->
      <div v-if="showSuggestions && suggestions.length > 0" class="suggestions-dropdown">
        <button
          v-for="suggestion in suggestions"
          :key="suggestion.id"
          type="button"
          @click="selectSuggestion(suggestion)"
          class="suggestion-item"
        >
          <TagIcon class="w-3 h-3" />
          {{ suggestion.name }}
        </button>
      </div>
    </div>

    <p class="hint-text">
      Separa los tags con comas o Enter. Se crearán automáticamente si no existen.
    </p>
  </div>
</template>

<style scoped>
.tag-input-container {
  width: 100%;
}

.tag-input-wrapper {
  position: relative;
  width: 100%;
  min-height: 80px;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: white;
  transition: all 0.2s;
}

.tag-input-wrapper:focus-within {
  border-color: #9ca3af;
  ring: 2px;
  ring-color: rgba(156, 163, 175, 0.2);
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.tag-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background-color: #3b82f6;
  color: white;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.tag-pill:hover {
  background-color: #2563eb;
}

.tag-remove-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.125rem;
  background-color: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 9999px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.tag-remove-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.tag-input {
  flex: 1;
  min-width: 200px;
  padding: 0.25rem 0.5rem;
  border: none;
  outline: none;
  font-size: 0.875rem;
  background: transparent;
}

.tag-input::placeholder {
  color: #9ca3af;
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.25rem;
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: none;
  background: white;
  text-align: left;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
  transition: background-color 0.15s;
}

.suggestion-item:hover {
  background-color: #f3f4f6;
}

.suggestion-item:not(:last-child) {
  border-bottom: 1px solid #e5e7eb;
}

.hint-text {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
}
</style>
