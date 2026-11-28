import { defineConfig } from 'vite'

// Vercel build (npm run build) -> admin-app/dist
// Local static-server build (npm run build:admin) -> ../admin
export default defineConfig(({ mode }) => ({
  base: mode === 'admin' ? './' : '/',
  build: {
    outDir: mode === 'admin' ? '../admin' : 'dist',
    emptyOutDir: true,
  },
}))
