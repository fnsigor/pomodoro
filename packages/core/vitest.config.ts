import { defineConfig } from 'vitest/config'

// core não toca DOM/browser (ver tsconfig.json: lib sem "dom"), então roda em node puro.
export default defineConfig({
  test: {
    environment: 'node',
  },
})
