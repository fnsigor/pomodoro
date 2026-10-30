import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['**/dist/**', '**/node_modules/**', '**/src-tauri/target/**', '**/src-tauri/gen/**']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // Regra "sem cor hardcoded": força uso de token do design system (Tailwind @theme).
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "JSXAttribute[name.name='className'] Literal[value=/#[0-9a-fA-F]{3,8}\\b|rgba?\\(/]",
          message:
            'Não use cor hardcoded em className — use um token do design system (Tailwind @theme).',
        },
      ],
    },
  },
  {
    // Regra 1 do CLAUDE.md: packages/core não importa nada de plataforma, UI ou adaptador.
    files: ['packages/core/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            '@tauri-apps/*',
            'react',
            'react-dom',
            '@app/adapters',
            '@focusflow/ui',
            '@focusflow/adapters-web',
            '@focusflow/adapters-tauri',
          ],
        },
      ],
      'no-restricted-globals': [
        'error',
        'window',
        'document',
        'localStorage',
        'sessionStorage',
        'navigator',
      ],
    },
  },
  {
    // packages/ui é só apresentação: não escolhe adaptador nem conhece Tauri.
    files: ['packages/ui/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: ['@tauri-apps/*', '@app/adapters', '@focusflow/adapters-web', '@focusflow/adapters-tauri'],
        },
      ],
    },
  },
  {
    files: ['**/*.test.{ts,tsx}'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
])
