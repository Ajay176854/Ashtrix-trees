import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function getPlugins() {
  const plugins = [react()]
  
  // Only try to load prerender if we are in production or building
  if (process.env.NODE_ENV === 'production' || process.env.VITE_PRERENDER === 'true') {
    try {
      const prerender = (await import('vite-plugin-prerender')).default
      plugins.push(
        prerender({
          staticDir: path.join(__dirname, 'dist'),
          routes: [
            '/',
            '/shop',
            '/tshirts-in-thiruvarur',
            '/tshirts-delivery-mannargudi',
            '/buy-tshirts-needamangalam',
            '/tshirts-kodavasal',
            '/tshirts-vedaranyam'
          ],
        })
      )
    } catch (e) {
      console.warn('Could not load vite-plugin-prerender:', e.message)
    }
  }
  
  return plugins
}

export default defineConfig(async () => ({
  plugins: await getPlugins(),
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    proxy: {
      '/api': { target: 'http://localhost:8000', changeOrigin: true },
      '/uploads': { target: 'http://localhost:8000', changeOrigin: true },
    },
  },
}))
