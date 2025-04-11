<script setup>
import { ref, watch } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { Bold, Italic, List, Link as LinkIcon, Heading1, Heading2, Code, Quote, Undo, Redo } from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        target: '_blank',
        rel: 'noopener noreferrer'
      }
    })
  ],
  onUpdate: () => {
    emit('update:modelValue', editor.value.getHTML())
  }
})

watch(() => props.modelValue, (newValue) => {
  if (editor.value && newValue !== editor.value.getHTML()) {
    editor.value.commands.setContent(newValue, false)
  }
})
</script>

<template>
  <div class="tiptap-editor">
    <div v-if="editor" class="toolbar">
      <div class="toolbar-group">
        <button @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
          :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }" title="Encabezado 1">
          <Heading1 class="icon" />
        </button>
        <button @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
          :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }" title="Encabezado 2">
          <Heading2 class="icon" />
        </button>
      </div>

      <div class="toolbar-group">
        <button @click="editor.chain().focus().toggleBold().run()" :class="{ 'is-active': editor.isActive('bold') }"
          title="Negrita">
          <Bold class="icon" />
        </button>
        <button @click="editor.chain().focus().toggleItalic().run()" :class="{ 'is-active': editor.isActive('italic') }"
          title="Cursiva">
          <Italic class="icon" />
        </button>
        <button @click="editor.chain().focus().toggleCode().run()" :class="{ 'is-active': editor.isActive('code') }"
          title="Código">
          <Code class="icon" />
        </button>
      </div>

      <div class="toolbar-group">
        <button @click="editor.chain().focus().toggleBulletList().run()"
          :class="{ 'is-active': editor.isActive('bulletList') }" title="Lista">
          <List class="icon" />
        </button>
        <button @click="editor.chain().focus().toggleBlockquote().run()"
          :class="{ 'is-active': editor.isActive('blockquote') }" title="Cita">
          <Quote class="icon" />
        </button>
        <button @click="editor.chain().focus().toggleLink({ href: prompt('URL:', 'https://') }).run()"
          :class="{ 'is-active': editor.isActive('link') }" title="Enlace">
          <LinkIcon class="icon" />
        </button>
      </div>

      <div class="toolbar-group">
        <button @click="editor.chain().focus().undo().run()" :disabled="!editor.can().undo()" title="Deshacer">
          <Undo class="icon" />
        </button>
        <button @click="editor.chain().focus().redo().run()" :disabled="!editor.can().redo()" title="Rehacer">
          <Redo class="icon" />
        </button>
      </div>
    </div>
    <editor-content :editor="editor" class="editor-content" />
  </div>
</template>

<style scoped>
.tiptap-editor {
  border: none;
  border-radius: 4px;
  overflow: hidden;
}

.toolbar {
  display: flex;
  gap: 8px;
  padding: 8px;
  background-color: #f9f9f9;
  border-bottom: 1px solid #eaeaea;
  flex-wrap: wrap;
}

.toolbar-group {
  display: flex;
  gap: 4px;
  border-right: 1px solid #eaeaea;
  padding-right: 8px;
  margin-right: 4px;
}

.toolbar-group:last-child {
  border-right: none;
}

.toolbar button {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 4px;
  padding: 6px;
  cursor: pointer;
  color: #555;
  transition: all 0.2s ease;
}

.toolbar button:hover {
  background-color: #eaeaea;
}

.toolbar button.is-active {
  background-color: #e0e0e0;
  color: #000;
}

.toolbar button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.icon {
  width: 18px;
  height: 18px;
}

.editor-content {
  min-height: 200px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.editor-content:focus {
  outline: none;
}

/* Estilos para el contenido del editor */
.editor-content h1 {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.editor-content h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.editor-content p {
  margin-bottom: 0.75rem;
}

.editor-content ul {
  list-style-type: disc;
  padding-left: 1.5rem;
  margin-bottom: 0.75rem;
}

.editor-content blockquote {
  border-left: 3px solid #e0e0e0;
  padding-left: 1rem;
  color: #666;
  font-style: italic;
  margin: 1rem 0;
}

.editor-content a {
  color: #2563eb;
  text-decoration: underline;
}

.editor-content code {
  background-color: #f0f0f0;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-family: monospace;
}

@media (max-width: 640px) {
  .toolbar {
    gap: 4px;
  }

  .toolbar-group {
    padding-right: 4px;
    margin-right: 2px;
  }

  .toolbar button {
    padding: 4px;
  }

  .icon {
    width: 16px;
    height: 16px;
  }
}
</style>
