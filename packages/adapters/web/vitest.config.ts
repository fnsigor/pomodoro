import { defineConfig } from 'vitest/config'

// Adaptador web toca localStorage de verdade, então os testes rodam em jsdom
// (diferente do core, que roda em node puro).
export default defineConfig({
  test: {
    environment: 'jsdom',
  },
})
