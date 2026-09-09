import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

const apiOrigin = (value: string | undefined, mode: string): string => {
  if (!value) throw new Error('VITE_API_URL is required')

  const url = new URL(value)
  if (
    (url.protocol !== 'http:' && url.protocol !== 'https:') ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  ) {
    throw new Error('VITE_API_URL must be an HTTP(S) origin without a path, query, or fragment')
  }

  if (mode === 'production' && url.protocol !== 'https:') {
    throw new Error('VITE_API_URL must use HTTPS in production builds')
  }

  return url.origin
}

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), '')
  const normalizedApiOrigin = apiOrigin(environment.VITE_API_URL, mode)

  return {
    define: { 'import.meta.env.VITE_API_URL': JSON.stringify(normalizedApiOrigin) },
    plugins: [react()],
    server: { port: 5174, strictPort: true },
  }
})
