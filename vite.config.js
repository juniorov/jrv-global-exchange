import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['icons/*.png', 'icons/*.svg'],
      manifest: {
        name: 'Tipo de Cambio Global',
        short_name: 'TipoCambio',
        description: 'Conversor de monedas multi-destino con soporte offline',
        theme_color: '#1d4ed8',
        background_color: '#f1f5f9',
        display: 'standalone',
        start_url: '/',
        lang: 'es',
        orientation: 'portrait-primary',
        categories: ['finance', 'utilities'],
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /\.woff2?$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-cache',
              expiration: { maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/open\.er-api\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'exchange-rates-cache',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 60 * 60 * 24,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})
