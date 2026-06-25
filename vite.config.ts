import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        // Visible build marker so it's unambiguous WHICH build is live (Vercel sets VERCEL_GIT_COMMIT_SHA
        // at build time; 'local' in dev). Shown faintly on the home screen — see components/HomeUI.tsx.
        __BUILD_ID__: JSON.stringify((process.env.VERCEL_GIT_COMMIT_SHA || 'local').slice(0, 7)),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
