import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import * as path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // treat all tags with a dash as custom elements
          isCustomElement: (tag) => tag.includes('a-')
        }
      }
    }),
    VitePWA({
      registerType: 'prompt',
      devOptions: {
        enabled: true
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      includeAssets: ['/android-chrome-192x192.png', '/android-chrome-512x512.png'],
      manifest: {
        "name": "Cartes.io",
        "short_name": "Cartes",
        "description": "Create maps, add markers, and share anywhere without even having to sign up.",
        "icons": [
          {
            "src": "/android-chrome-192x192.png",
            "sizes": "192x192",
            "type": "image/png"
          },
          {
            "src": "/android-chrome-512x512.png",
            "sizes": "512x512",
            "type": "image/png"
          }
        ],
        "theme_color": "#ffffff",
        "background_color": "#ffffff",
        "display": "standalone",
        "start_url": "/",
        "categories": ["Cartes.io", "maps", "mapping", "markers", "location"]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  }
})