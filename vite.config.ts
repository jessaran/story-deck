/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages sirve el repo en /story-deck/. Cambia BASE si renombras el repo.
const BASE = process.env.BASE_PATH ?? '/story-deck/'

/**
 * Solo en producción (el servidor de desarrollo usa scripts en línea): política de contenido que
 * únicamente permite recursos propios y el contador anónimo de Cloudflare Web Analytics (sin cookies).
 * GitHub Pages no deja poner cabeceras, así que va como <meta>.
 */
// Token público de Cloudflare Web Analytics: va en la página, no es un secreto.
const CF_BEACON = '<script type="module" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon=\'{"token": "439f12650ded468487948df19e2859de"}\'></script>'

const CSP = [
  "default-src 'self'",
  "script-src 'self' https://static.cloudflareinsights.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "connect-src 'self' https://cloudflareinsights.com",
  "manifest-src 'self'",
  "worker-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join('; ')

const securityMeta = (): Plugin => ({
  name: 'security-meta',
  apply: 'build',
  transformIndexHtml: (html) =>
    html
      .replace('<meta charset="UTF-8" />', `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />\n    <meta name="referrer" content="no-referrer" />`)
      .replace('</body>', `  ${CF_BEACON}\n  </body>`),
})

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    tailwindcss(),
    securityMeta(),
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
        globPatterns: ['**/*.{js,css,html,png,svg,webp,woff,woff2}'],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  test: { environment: 'jsdom' },
})
