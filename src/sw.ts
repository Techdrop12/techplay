/// <reference lib="webworker" />
/* eslint-disable no-undef */
import { clientsClaim, setCacheNameDetails } from 'workbox-core'
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute, setCatchHandler } from 'workbox-routing'
import {
  CacheFirst,
  StaleWhileRevalidate,
  NetworkFirst,
  NetworkOnly,
} from 'workbox-strategies'
import { BackgroundSyncPlugin } from 'workbox-background-sync'
import { ExpirationPlugin } from 'workbox-expiration'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { RangeRequestsPlugin } from 'workbox-range-requests'
import { enable as navigationPreloadEnable } from 'workbox-navigation-preload'

declare let self: ServiceWorkerGlobalScope

/* ============================= Base & lifecycle ============================ */

setCacheNameDetails({
  prefix: 'techplay',
  suffix: 'v1',
  precache: 'precache',
  runtime: 'runtime',
})

self.skipWaiting()
clientsClaim()
navigationPreloadEnable()

/* ================================ Precache ================================= */

// Manifest injecté au build par Workbox
precacheAndRoute(self.__WB_MANIFEST || [], {
  ignoreURLParametersMatching: [/^utm_/, /^fbclid$/],
})
cleanupOutdatedCaches()

/* =============================== Constants ================================= */

const OFFLINE_IMG = '/fallback.png'
const PAGE_CACHE = 'tp-pages'
const IMG_CACHE = 'tp-images'

/* ============== Pré-chargement du fallback image à l'install =============== */

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(IMG_CACHE)
        await cache.add(OFFLINE_IMG).catch(() => {})
      } catch {}
    })()
  )
})

/* ============================ Stratégies Pages ============================= */

const pageStrategy = new NetworkFirst({
  cacheName: PAGE_CACHE,
  networkTimeoutSeconds: 10,
  plugins: [
    new CacheableResponsePlugin({ statuses: [0, 200] }),
    new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 7 * 24 * 60 * 60 }),
  ],
})
registerRoute(({ request }) => request.mode === 'navigate', pageStrategy)

/* ============================ Google Fonts ================================= */

registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com',
  new StaleWhileRevalidate({
    cacheName: 'tp-gfonts-css',
    plugins: [new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 7 * 24 * 60 * 60 })],
  })
)
registerRoute(
  ({ url }) => url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'tp-gfonts-webfonts',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 }),
    ],
  })
)

/* ============================ Next static / image ========================== */

registerRoute(
  ({ url }) => url.pathname.startsWith('/_next/image'),
  new StaleWhileRevalidate({
    cacheName: 'tp-next-image',
    plugins: [new ExpirationPlugin({ maxEntries: 80, maxAgeSeconds: 7 * 24 * 60 * 60 })],
  })
)

registerRoute(
  ({ request }) => ['style', 'script', 'worker'].includes(request.destination),
  new StaleWhileRevalidate({
    cacheName: 'tp-static-resources',
    plugins: [new ExpirationPlugin({ maxEntries: 80, maxAgeSeconds: 24 * 60 * 60 })],
  })
)

/* ================================= Images ================================== */

registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: IMG_CACHE,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 180, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  })
)

/* ================================= Fonts =================================== */

registerRoute(
  ({ request }) => request.destination === 'font',
  new StaleWhileRevalidate({
    cacheName: 'tp-fonts',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 40, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  })
)

/* ============================ Media (range) ================================ */

registerRoute(
  ({ request }) => request.destination === 'audio' || request.destination === 'video',
  new CacheFirst({
    cacheName: 'tp-media',
    plugins: [
      new RangeRequestsPlugin(),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 24, maxAgeSeconds: 7 * 24 * 60 * 60 }),
    ],
  })
)

/* ============================== API – GET ================================== */

registerRoute(
  ({ url, request }) =>
    request.method === 'GET' &&
    url.origin === self.location.origin &&
    url.pathname.startsWith('/api/') &&
    !url.pathname.startsWith('/api/auth/'),
  new NetworkFirst({
    cacheName: 'tp-api',
    networkTimeoutSeconds: 10,
    plugins: [new ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 24 * 60 * 60 })],
  })
)

/* ===================== API – mutations (POST/PUT/DEL) ====================== */
/* Offline queue via Background Sync (panier, avis, subscribe, checkout…)     */
/* ⚠️ exclut les endpoints sensibles (webhooks, auth).                         */

const mutationQueue = new BackgroundSyncPlugin('tp-api-queue', {
  maxRetentionTime: 24 * 60, // minutes
})

registerRoute(
  ({ url, request }) => {
    if (url.origin !== self.location.origin) return false
    if (!url.pathname.startsWith('/api/')) return false
    if (url.pathname.startsWith('/api/auth/')) return false
    if (url.pathname.startsWith('/api/stripe-webhook')) return false
    return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)
  },
  new NetworkOnly({ plugins: [mutationQueue] }),
  'POST'
)
registerRoute(
  ({ url, request }) =>
    url.origin === self.location.origin &&
    url.pathname.startsWith('/api/') &&
    !url.pathname.startsWith('/api/auth/') &&
    !url.pathname.startsWith('/api/stripe-webhook') &&
    ['PUT', 'PATCH', 'DELETE'].includes(request.method),
  new NetworkOnly({ plugins: [mutationQueue] })
)

/* ========================= Cross-origin images ============================= */

registerRoute(
  ({ url }) =>
    url.origin !== self.location.origin && /\.(?:png|jpe?g|webp|gif|svg)$/.test(url.pathname),
  new CacheFirst({
    cacheName: 'tp-ximg',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 80, maxAgeSeconds: 7 * 24 * 60 * 60 }),
    ],
  })
)

/* ============================== Fallbacks ================================= */

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
      const cache = await caches.open(IMG_CACHE)
      const cached = await cache.match(OFFLINE_IMG)
      return cached ?? Response.error()
    }
    default:
      return Response.error()
  }
})

/* ============================== Messaging ================================= */

self.addEventListener('message', (event) => {
  if (!event.data) return
  // 1) skip waiting
  if (event.data.type === 'SKIP_WAITING') self.skipWaiting()

  // 2) purge runtime caches on demand
  if (event.data.type === 'CLEAR_RUNTIME_CACHES') {
    event.waitUntil(
      (async () => {
        const keys = await caches.keys()
        await Promise.all(
          keys
            .filter((k) => k.startsWith('techplay-runtime') || k.startsWith('tp-'))
            .map((k) => caches.delete(k))
        )
      })()
    )
  }
})
