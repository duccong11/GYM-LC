import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';
export default defineConfig({
  plugins: [react(), tailwind()],
  server: {
    host: '127.0.0.1',
    port: Number(process.env.FRONTEND_PORT || 3000),
    strictPort: true,
    proxy: {
      '/api': {
        target: process.env.BACKEND_URL || 'http://127.0.0.1:4000',
        changeOrigin: false,
      },
    },
    watch: { ignored: ['**/outputs/**', '**/docs/**'] },
  },
  build: { outDir: 'dist' },
});
