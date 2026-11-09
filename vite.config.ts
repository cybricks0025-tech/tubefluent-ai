import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { youtubeLearningApiPlugin } from './server/apiPlugin.mjs';

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), youtubeLearningApiPlugin()],
  server: {
    port: 5173,
    host: true
  }
});
