import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@app/adapters': fileURLToPath(new URL('../../packages/adapters/web/src/index.ts', import.meta.url)),
    },
  },
})
