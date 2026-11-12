/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages sirve el repo en /story-deck/. Cambia BASE si renombras el repo.
const BASE = process.env.BASE_PATH ?? '/story-deck/'

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.png', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Story Deck',
        short_name: 'Story Deck',
        description: 'Un mazo de cartas para desatascar la escritura.',
        lang: 'es',
        start_url: BASE,
        scope: BASE,
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#FFFFFF',
        background_color: '#FFFFFF',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [{ name: 'Tip del día', url: `${BASE}#/tip`, icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }] }],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff,woff2}'],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  test: { environment: 'jsdom' },
})
