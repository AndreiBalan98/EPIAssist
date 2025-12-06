import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // In production (Vercel), use production API
  // In development (local), use localhost
  const isDev = mode === 'development';
  const apiTarget = isDev 
    ? 'http://localhost:8000'
    : 'https://epiassist.onrender.com';

  console.log(`🔧 Vite mode: ${mode}`);
  console.log(`🌐 API proxy target: ${apiTarget}`);

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@services': path.resolve(__dirname, './src/services'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@utils': path.resolve(__dirname, './src/utils'),
      },
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('❌ Proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('➡️  Proxying:', req.method, req.url, '→', apiTarget);
            });
          },
        },
      },
    },
  };
});