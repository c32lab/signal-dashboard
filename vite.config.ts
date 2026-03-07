/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
    exclude: ['**/e2e/**', '**/node_modules/**', '**/dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'e2e/**',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/*.config.{ts,js,mjs}',
        '**/*.d.ts',
      ],
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-recharts': ['recharts'],
          'vendor-swr': ['swr'],
        },
      },
    },
  },
  server: {
    port: 3080,
    proxy: {
      '/api': 'http://localhost:18800',
      '/predict-api': {
        target: 'http://localhost:18801',
        rewrite: (path) => path.replace(/^\/predict-api/, ''),
      },
      '/data-api': {
        target: 'http://localhost:8081',
        rewrite: (path) => path.replace(/^\/data-api/, ''),
      },
    },
  },
})
