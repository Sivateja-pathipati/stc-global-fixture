import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// `base: '/'` is mandatory, not stylistic. Shells are emitted at nested depths
// (dist/de-DE/blog/<slug>/index.html); with a relative base their asset URLs would resolve
// against the shell's own directory and 404. See docs/determinism.md.
export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
  server: { port: 4310, strictPort: true },
  preview: { port: 4310, strictPort: true },
  build: {
    outDir: 'dist',
    target: 'es2020',
    sourcemap: false,
    cssCodeSplit: false,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        // No content hashes. Cache busting is irrelevant for a fixture, and stable names
        // make a two-build determinism diff readable instead of a wall of renames.
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
});
