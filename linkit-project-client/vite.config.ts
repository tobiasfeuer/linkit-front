import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/sitemap.xml': {
        target: 'https://linkit-server.onrender.com',
        changeOrigin: true
      }
    }
  },
  preview: {
    proxy: {
      '/sitemap.xml': {
        target: 'https://linkit-server.onrender.com',
        changeOrigin: true
      }
    }
  }
})
