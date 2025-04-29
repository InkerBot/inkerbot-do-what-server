import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist/public',
    rollupOptions: {
      output: {
        manualChunks: {
          'lit': ['lit', 'lit-html', 'lit-element', '@lit/reactive-element'],
          'material': ['@material/web/all'],
        }
      }
    },
    cssCodeSplit: true,
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
  },
  server: {
    proxy: {
      '/cgi-bin': {
        target: 'http://localhost:8080'
      },
    },
  },
  optimizeDeps: {
    include: ['lit', 'lit-html', 'lit-element', '@lit/reactive-element', 'tslib']
  }
})
