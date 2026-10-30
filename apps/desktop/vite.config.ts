import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// `base: './'` é obrigatório: URLs absolutas quebram em `tauri://localhost` (CLAUDE.md).
// Porta e `strictPort` batem com `build.devUrl` em `src-tauri/tauri.conf.json`.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@app/adapters': fileURLToPath(new URL('../../packages/adapters/tauri/src/index.ts', import.meta.url)),
    },
  },
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
  },
})
