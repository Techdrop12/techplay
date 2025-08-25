// next.config.mjs — Ultra Premium FINAL (+ redirects produits/packs, PWA custom SW)
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import withPWA from 'next-pwa'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/config.ts')

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const isDev = process.env.NODE_ENV === 'development'

/** PWA (workbox) — on compile TON SW custom (src/sw.ts) */
const withPwaPlugin = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: isDev, // actif en prod uniquement
  buildExcludes: [/middleware-manifest\.json$/],
  fallbacks: { image: '/fallback.png' },
  swSrc: 'src/sw.ts', // ⬅️ important : on génère /public/sw.js à partir de ce fichier
})

/** Headers de sécu globaux (safe pour SPA, analytics via consent) */
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-site' },
  { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
  { key: 'Origin-Agent-Cluster', value: '?1' },
  {
    key: 'Permissions-Policy',
    value:
      "accelerometer=(), ambient-light-sensor=(), autoplay=(), battery=(), camera=(), cross-origin-isolated=(), display-capture=(), document-domain=(), encrypted-media=(), fullscreen=*, geolocation=(), gyroscope=(), hid=(), idle-detection=(), keyboard-map=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=*, publickey-credentials-get=(), usb=(), screen-wake-lock=(), web-share=(), xr-spatial-tracking=()",
  },
]

export default withNextIntl(
  withPwaPlugin({
    reactStrictMode: true,
    compress: true,
    poweredByHeader: false,
    output: 'standalone',
    productionBrowserSourceMaps: false,

    experimental: {
      scrollRestoration: true,
      optimizePackageImports: ['react-icons', 'lodash'],
    },

    images: {
      remotePatterns: [{ protocol: 'https', hostname: '**' }],
      formats: ['image/avif', 'image/webp'],
      dangerouslyAllowSVG: true,
      contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
      unoptimized: false,
    },

    eslint: { ignoreDuringBuilds: true },

    compiler: {
      removeConsole: { exclude: ['error', 'warn'] },
      // reactRemoveProperties: true,
    },

    // 🔁 Redirects SEO — fusion produits/packs
    async redirects() {
      return [
        { source: '/produit', destination: '/products', permanent: true },
        { source: '/produit/', destination: '/products', permanent: true },
        { source: '/produit/:slug', destination: '/products/:slug', permanent: true },

        { source: '/pack', destination: '/products/packs', permanent: true },
        { source: '/pack/', destination: '/products/packs', permanent: true },
        { source: '/pack/:slug', destination: '/products/packs/:slug', permanent: true },

        { source: '/:locale/produit', destination: '/:locale/products', permanent: true },
        { source: '/:locale/produit/', destination: '/:locale/products', permanent: true },
        { source: '/:locale/produit/:slug', destination: '/:locale/products/:slug', permanent: true },

        { source: '/:locale/pack', destination: '/:locale/products/packs', permanent: true },
        { source: '/:locale/pack/', destination: '/:locale/products/packs', permanent: true },
        { source: '/:locale/pack/:slug', destination: '/:locale/products/packs/:slug', permanent: true },
      ]
    },

    // Caching & sécurité fine-grainée
    async headers() {
      return [
        { source: '/:path*', headers: securityHeaders },
        { source: '/api/:path*', headers: [{ key: 'Cache-Control', value: 'no-store' }] },
        { source: '/_next/static/:any*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
        {
          source: '/:all*.(js|css|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2)',
          headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
        },
        { source: '/(site.webmanifest|manifest.json)', headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }] },
        { source: '/icons/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
        {
          source: '/sw.js',
          headers: [
            { key: 'Service-Worker-Allowed', value: '/' },
            { key: 'Cache-Control', value: 'no-cache' },
          ],
        },
      ]
    },

    webpack: (config) => {
      config.resolve.alias['@'] = path.resolve(__dirname, 'src')
      config.infrastructureLogging = { ...config.infrastructureLogging, level: 'error' }
      return config
    },

    httpAgentOptions: { keepAlive: true },
  })
)
