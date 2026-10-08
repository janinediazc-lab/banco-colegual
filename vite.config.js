import { defineConfig } from 'vite';
import { bancoColegualBackend } from './server/backend-plugin.js';

export default defineConfig({
  base: './', // Permite que funcione en cualquier hosting web, subdirectorio o GitHub Pages
  plugins: [
    bancoColegualBackend()
  ],
  server: {
    host: true, // Expone la plataforma en la red local Wi-Fi para celulares de profesores
    port: 5173,
    open: false
  },
  preview: {
    host: true,
    port: 5173
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
});
