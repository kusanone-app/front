import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  root: '.',          
  base: '/',          
  plugins: [preact()],
  publicDir: 'public', 
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
