import { defineWorkspace } from 'vitest/config'

// Cada pacote com testes tem seu próprio vitest.config.ts (environment node ou jsdom).
export default defineWorkspace([
  'packages/core/vitest.config.ts',
  'packages/adapters/web/vitest.config.ts',
  'packages/app/vitest.config.ts',
])
