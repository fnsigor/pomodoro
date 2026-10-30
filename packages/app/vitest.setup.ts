import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import '@testing-library/jest-dom/vitest'

// Sem `test.globals: true` no vitest.config.ts, o auto-cleanup do testing-library
// não se registra sozinho — sem isso, o DOM de um teste vaza pro próximo `render`.
afterEach(() => {
  cleanup()
})
