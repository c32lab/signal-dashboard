import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3080,
    proxy: {
      '/api': 'http://localhost:18810',
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
