import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Connect, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const raiz = fileURLToPath(new URL('.', import.meta.url))

/** Em dev/preview, /app precisa servir app/index.html (o build gera esse arquivo). */
function rotaApp(): Plugin {
  const redirecionar: Connect.NextHandleFunction = (req, _res, next) => {
    if (req.url === '/app' || req.url === '/app/') req.url = '/app/index.html'
    next()
  }

  return {
    name: 'focusflow-rota-app',
    configureServer(server) {
      server.middlewares.use(redirecionar)
    },
    configurePreviewServer(server) {
      server.middlewares.use(redirecionar)
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), rotaApp()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(raiz, 'index.html'),
        app: resolve(raiz, 'app/index.html'),
      },
    },
  },
  resolve: {
    alias: {
      '@app/adapters': fileURLToPath(new URL('../../packages/adapters/web/src/index.ts', import.meta.url)),
    },
  },
})
