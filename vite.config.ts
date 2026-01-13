import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 4000,
        host: '0.0.0.0',
        // Proxy API requests to backend server
        proxy: {
          '/api': {
            target: 'http://localhost:4001',
            changeOrigin: true,
          }
        }
      },
      plugins: [react()],
      define: {
        // API 키는 더 이상 클라이언트에 노출하지 않음
        // 백엔드 프록시 서버에서만 관리
        'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || '')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
