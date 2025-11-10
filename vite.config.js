import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue(), vueDevTools()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },

    server: {
        proxy: {
            // '/api'로 시작하는 모든 요청을 백엔드(3000번 포트)로 전달
            '/api': {
                target: 'http://localhost:8080', // 새 Express 백엔드 주소
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ''), // 백엔드로 보낼 때 '/api'는 제거
            },
        },
    },
});
