import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'react-vendor';
if (id.includes('node_modules/@supabase')) return 'supabase-vendor';
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  server: {
    proxy: {
      '/api/naver-search': {
        target: 'https://openapi.naver.com',
        changeOrigin: true,
        rewrite: (path) => {
          const url = new URL(path, 'http://localhost');
          const validTypes: Record<string, string> = { local: 'local', image: 'image', blog: 'blog', vclip: 'vclip' };
          const type = validTypes[url.searchParams.get('type') || ''] || 'local';
          url.searchParams.delete('type');
          return `/v1/search/${type}.json?${url.searchParams.toString()}`;
        },
        headers: {
          'X-Naver-Client-Id': process.env.VITE_NAVER_CLIENT_ID || '',
          'X-Naver-Client-Secret': process.env.VITE_NAVER_CLIENT_SECRET || '',
        },
      },
    },
  },
})
