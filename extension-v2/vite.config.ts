import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        settings: 'src/ui/main.html'
      },
      output: {
        entryFileNames: '[name].js'
      }
    }
  }
});
