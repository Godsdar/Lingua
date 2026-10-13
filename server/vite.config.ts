import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    ssr: resolve(import.meta.dirname, 'src/index.ts'),
    outDir: resolve(import.meta.dirname, '../server-dist'),
    target: 'node24', minify: false,
    rollupOptions: { output: { format: 'es', entryFileNames: 'index.mjs' } }
  }
})
