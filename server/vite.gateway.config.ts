import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    ssr: resolve(import.meta.dirname, 'src/public-gateway.ts'),
    outDir: resolve(import.meta.dirname, '../server-dist'), emptyOutDir: false,
    target: 'node24', minify: false,
    rollupOptions: { output: { format: 'es', entryFileNames: 'public-gateway.mjs' } }
  }
})
