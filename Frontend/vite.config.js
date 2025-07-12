// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/recommend': {
        target: 'https://your-backend-url.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
