import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        // Give the backend time to boot (especially MongoMemoryServer takes ~10s)
        proxyTimeout: 30000,
        timeout: 30000,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.warn('[vite-proxy] Backend not ready yet:', err.message);
          });
          proxy.on('proxyReq', (_proxyReq, req, _res) => {
            console.log('[vite-proxy] →', req.method, req.url);
          });
        },
      },
    },
  },
});
