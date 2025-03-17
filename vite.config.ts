import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import vuetify from 'vite-plugin-vuetify'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    vuetify({ autoImport: true }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // URL do backend
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // Remove o prefixo "/api"
      },
    },
    host: '127.0.0.1',
    port: 8000 
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
