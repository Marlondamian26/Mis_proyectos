import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve, dirname } from 'path'
import { copyFileSync, existsSync, mkdirSync } from 'fs'
import path from 'path'

function redirectPlugin() {
  return {
    name: 'redirect-plugin',
    closeBundle() {
      const outDir = resolve(__dirname, '..', 'backend', 'sitio')
      const redirectFile = resolve(outDir, '_redirects')
      if (!existsSync(redirectFile)) {
        const srcRedirects = resolve(__dirname, 'public', '_redirects')
        if (existsSync(srcRedirects)) {
          copyFileSync(srcRedirects, redirectFile)
        }
      }
    }
  }
}

export default defineConfig({
  plugins: [react(), redirectPlugin()],
  base: '/',
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    assetsDir: 'assets',
    emptyOutDir: true,
  },
  preview: {
    port: 4173,
  },
})
