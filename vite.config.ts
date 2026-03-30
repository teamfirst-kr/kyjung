import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'react-vendor';
          if (id.includes('node_modules/leaflet') || id.includes('node_modules/react-leaflet')) return 'leaflet-vendor';
          if (id.includes('node_modules/@supabase')) return 'supabase-vendor';
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  server: {
    proxy: {
      '/api/naver': {
        target: 'https://openapi.naver.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/naver/, ''),
        headers: {
          'X-Naver-Client-Id': process.env.VITE_NAVER_CLIENT_ID || '',
          'X-Naver-Client-Secret': process.env.VITE_NAVER_CLIENT_SECRET || '',
        },
      },
    },
  },
})
