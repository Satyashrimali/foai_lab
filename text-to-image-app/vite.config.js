import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
    '/hf': {
        target: 'https://api-inference.huggingface.co/models',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/hf/, '')
      }
    }
  }
})
