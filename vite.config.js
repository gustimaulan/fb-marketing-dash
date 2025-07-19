import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@/components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@/composables': fileURLToPath(new URL('./src/composables', import.meta.url)),
      '@/stores': fileURLToPath(new URL('./src/stores', import.meta.url)),
      '@/api': fileURLToPath(new URL('./src/api', import.meta.url)),
      '@/utils': fileURLToPath(new URL('./src/utils', import.meta.url))
    },
  },
  build: {
    // Enable source maps for better debugging
    sourcemap: true,
    // Optimize chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'pinia'],
          'chart-vendor': ['chart.js'],
          'query-vendor': ['@tanstack/vue-query']
        }
      }
    },
    // Reduce bundle size warnings threshold
    chunkSizeWarningLimit: 1000
  },
  server: {
    // Better development server performance
    hmr: {
      overlay: false
    },
    // Auto-open browser in development
    open: true
  },
  // Enable CSS code splitting
  css: {
    codeSplit: true
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['vue', 'pinia', 'chart.js', '@tanstack/vue-query']
  }
})
