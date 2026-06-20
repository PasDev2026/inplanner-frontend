/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    ...(process.env.ANALYZE
      ? [visualizer({ open: true, gzipSize: true, brotliSize: true })]
      : []),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
    css: false,
    env: {
      VITE_API_URL: 'http://localhost:3000/api/v1/',
    },
  },
})
