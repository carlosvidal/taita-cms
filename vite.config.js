import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'process.env': {
      VITE_API_URL:
        process.env.NODE_ENV === 'production'
          ? 'https://your-render-api-url.onrender.com'
          : 'http://localhost:3000',
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
