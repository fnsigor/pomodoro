import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Mesmo alias do tsconfig.json do pacote — aqui resolvido de fato pro Vitest,
// já que o pacote só roda sob o build de cada app (cujo Vite resolve o alias real).
export default defineConfig({
  resolve: {
    alias: {
      '@app/adapters': fileURLToPath(new URL('../adapters/web/src/index.ts', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
})
