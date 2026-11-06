import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// En desarrollo, Vite corre en :5173 y reenvia /api al backend Express en :3000.
// En Docker no se usa: Express sirve el build (web/dist) y la API en el mismo puerto.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
