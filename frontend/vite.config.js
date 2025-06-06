import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api/user': {
        target: 'http://localhost:5006',
        changeOrigin: true,
      },
      '/api/production-management': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/api/production-planning': {
        target: 'http://localhost:5002',
        changeOrigin: true,
      },
      '/api/machine-queue': {
        target: 'http://localhost:5003',
        changeOrigin: true,
      },
      '/api/material-inventory': {
        target: 'http://localhost:5004',
        changeOrigin: true,
      },
      '/api/production-feedback': {
        target: 'http://localhost:5005',
        changeOrigin: true,
      },
    },
  },
});