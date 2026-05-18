import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// Proxy local que replica exactamente el rewrite del nginx.conf:
//   /api/ventas/v1/ventas  → rewrite → /api/v1/ventas → backend-ventas:8080
//   /api/despachos/v1/despachos → rewrite → /api/v1/despachos → backend-despachos:8081
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/ventas': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/ventas/, '/api')
      },
      '/api/despachos': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/despachos/, '/api')
      }
    }
  }
})
