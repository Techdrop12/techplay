/// <reference lib="webworker" />
/* eslint-disable no-undef */
import { clientsClaim } from 'workbox-core'
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute, setCatchHandler } from 'workbox-routing'
import { CacheFirst, StaleWhileRevalidate, NetworkFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { RangeRequestsPlugin } from 'workbox-range-requests'
import { enable as navigationPreloadEnable } from 'workbox-navigation-preload'

declare let self: ServiceWorkerGlobalScope

// ——— Lifecycle
self.skipWaiting()
clientsClaim()
navigationPreloadEnable()

// ——— Precache (manifest injecté au build)
precacheAndRoute(self.__WB_MANIFEST || [], {
  ignoreURLParametersMatching: [/^utm_/, /^fbclid$/],
})
cleanupOutdatedCaches()

// ——— Assurer la présence du fallback image en cache (si pas injecté)
const OFFLINE_IMG = '/fallback.png'
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open('tp-images')
        await cache.add(OFFLINE_IMG).catch(() => {})
      } catch {}
    })()
  )
})

// ——— Pages / navigations
const pageStrategy = new NetworkFirst({
  cacheName: 'tp-pages',
  networkTimeoutSeconds: 10,
  plugins: [
    new CacheableResponsePlugin({ statuses: [0, 200] }),
    new ExpirationPlugin({ maxEntries: 40, maxAgeSeconds: 7 * 24 * 60 * 60 }),
  ],
})
registerRoute(({ request }) => request.mode === 'navigate', pageStrategy)

// ——— Google Fonts
registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com',
  new StaleWhileRevalidate({
    cacheName: 'tp-gfonts-css',
    plugins: [new ExpirationPlugin({ maxEntries: 8, maxAgeSeconds: 7 * 24 * 60 * 60 })],
  })
)
registerRoute(
  ({ url }) => url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'tp-gfonts-webfonts',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 8, maxAgeSeconds: 365 * 24 * 60 * 60 }),
    ],
  })
)

// ——— Next/Image
registerRoute(
  ({ url }) => url.pathname.startsWith('/_next/image'),
  new StaleWhileRevalidate({
    cacheName: 'tp-next-image',
    plugins: [new ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 7 * 24 * 60 * 60 })],
  })
)

// ——— Static (JS/CSS/Workers)
registerRoute(
  ({ request }) => ['style', 'script', 'worker'].includes(request.destination),
  new StaleWhileRevalidate({
    cacheName: 'tp-static-resources',
    plugins: [new ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 24 * 60 * 60 })],
  })
)

// ——— Images
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'tp-images',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 128, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  })
)

// ——— Fonts (woff/woff2)
registerRoute(
  ({ request }) => request.destination === 'font',
  new StaleWhileRevalidate({
    cacheName: 'tp-fonts',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  })
)

// ——— Media (audio/vidéo) avec reprise de plage
registerRoute(
  ({ request }) => request.destination === 'audio' || request.destination === 'video',
  new CacheFirst({
    cacheName: 'tp-media',
    plugins: [
      new RangeRequestsPlugin(),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 7 * 24 * 60 * 60 }),
    ],
  })
)

// ——— API (hors /api/auth)
registerRoute(
  ({ url }) =>
    url.origin === self.location.origin &&
    url.pathname.startsWith('/api/') &&
    !url.pathname.startsWith('/api/auth/'),
  new NetworkFirst({
    cacheName: 'tp-api',
    networkTimeoutSeconds: 10,
    plugins: [new ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 24 * 60 * 60 })],
  })
)

// ——— Cross-origin images
registerRoute(
  ({ url }) => url.origin !== self.location.origin && /\.(?:png|jpe?g|webp|gif|svg)$/.test(url.pathname),
  new CacheFirst({
    cacheName: 'tp-ximg',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 7 * 24 * 60 * 60 }),
    ],
  })
)

// ——— Fallbacks offline (document + image)
setCatchHandler(async ({ request }) => {
  switch (request.destination) {
    case 'document':
      return new Response(
        `<!doctype html><html lang="fr"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Hors ligne – TechPlay</title>
<style>html,body{margin:0}main{min-height:100vh;display:grid;place-items:center;background:#0f172a;color:#fff;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;text-align:center;padding:24px}</style>
<main><h1>Vous êtes hors ligne</h1><p>Revenez dès que la connexion est rétablie.<br/>Certaines pages récentes restent disponibles.</p></main>`,
        { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      )
    case 'image': {
      const cache = await caches.open('tp-images')
      const cached = await cache.match(OFFLINE_IMG)
      return cached ?? Response.error()
    }
    default:
      return Response.error()
  }
})

// ——— SKIP_WAITING demandé par l’app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting()
})
