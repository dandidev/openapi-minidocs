import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/main.ts',
      name: 'OpenApiMiniDocs',
      formats: ['iife'],
      fileName: () => 'minidocs.min.js'
    },
    outDir: 'dist',
    emptyOutDir: true
  }
});
