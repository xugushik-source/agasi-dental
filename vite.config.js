import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        staff: resolve(__dirname, 'staff.html'),
        tips: resolve(__dirname, 'tips.html'),
      },
    },
  },
});
