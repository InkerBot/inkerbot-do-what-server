import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist/public'
  },
  server: {
    proxy: {
      '/cgi-bin': {
        target: 'http://localhost:8080'
      },
    },
  },
})