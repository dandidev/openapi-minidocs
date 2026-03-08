import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react(), cssInjectedByJsPlugin()],
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    minify: 'esbuild',
    lib: {
      entry: resolve(__dirname, 'src/lib.tsx'),
      name: 'MiniDocs',
      formats: ['iife'],
      fileName: () => 'minidocs.min.js',
    },
    rollupOptions: {
      external: [],
    },
  },
});