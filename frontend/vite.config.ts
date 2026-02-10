import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false,
                configure: (proxy) => {
                    proxy.on('error', (err) => {
                        console.log('proxy error', err);
                    });
                    proxy.on('proxyReq', (_proxyReq, req) => {
                        console.log('Proxying:', req.method, req.url, '→', 'http://localhost:8080' + req.url);
                    });
                    proxy.on('proxyRes', (proxyRes, req) => {
                        console.log('Received:', proxyRes.statusCode, req.url);
                    });
                },
            },
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
})
