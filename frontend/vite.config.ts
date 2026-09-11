import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Os endpoints do backend (Spring Boot) são servidos pelo proxy do Vite para que o
// navegador fale sempre com a mesma origem — assim não é preciso configurar CORS na API.
const apiPaths = ['/users', '/bookings', '/courts']

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.VITE_API_TARGET || 'http://localhost:8080'

  return {
    plugins: [react()],
    server: {
      proxy: Object.fromEntries(
        apiPaths.map((path) => [path, { target, changeOrigin: true }]),
      ),
    },
  }
})
