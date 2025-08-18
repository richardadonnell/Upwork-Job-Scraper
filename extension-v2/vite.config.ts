import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        settings: 'src/ui/main.html',
        // background entry will be emitted to dist/background/worker.js
        background: 'src/background/worker.ts'
      },
      output: {
        // put the generated background entry in dist/background/worker.js
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === 'background' ? 'background/worker.js' : '[name].js'
        }
      }
    }
  }
});
