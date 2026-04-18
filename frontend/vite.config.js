import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve, dirname } from 'path'
import { copyFileSync, existsSync, mkdirSync } from 'fs'
import path from 'path'

function redirectPlugin() {
  return {
    name: 'redirect-plugin',
    closeBundle() {
      const redirectFile = resolve(__dirname, '..', 'backend', 'sitio', '_redirects')
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
    outDir: path.resolve(__dirname, '..', 'backend', 'sitio'),
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
        },
      },
    },
  },
  preview: {
    port: 4173,
  },
})
