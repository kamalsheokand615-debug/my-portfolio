import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: '../admin',
    emptyOutDir: true,
  },
})
