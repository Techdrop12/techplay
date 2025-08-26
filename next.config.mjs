// next.config.mjs — Ultra Premium FINAL (+ redirects produits/packs)
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import withPWA from 'next-pwa'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/config.ts')

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const isDev = process.env.NODE_ENV === 'development'

/** PWA (workbox) */
const withPwaPlugin = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: isDev, // actif en prod uniquement
  buildExcludes: [/middleware-manifest\.json$/],
  fallbacks: { image: '/fallback.png' },
})

/** Headers de sécu globaux (safe pour SPA, analytics via consent) */
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // politiques modernes, non bloquantes
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-site' },
  { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
  { key: 'Origin-Agent-Cluster', value: '?1' },
  // Permissions-Policy restrictive (élargis si besoin)
  { key: 'Permissions-Policy', value: 'accelerometer=(), ambient-light-sensor=(), autoplay=(), battery=(), camera=(), cross-origin-isolated=(), display-capture=(), document-domain=(), encrypted-media=(), fullscreen=*, geolocation=(), gyroscope=(), hid=(), idle-detection=(), keyboard-map=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=*, publickey-credentials-get=(), usb=(), screen-wake-lock=(), web-share=(), xr-spatial-tracking=()' },
]

export default withNextIntl(
  withPwaPlugin({
    reactStrictMode: true,
    compress: true,
    poweredByHeader: false,
    output: 'standalone', // déploiement Docker/Vercel allégé
    productionBrowserSourceMaps: false,

    experimental: {
      scrollRestoration: true,
      // tree-shaking/auto-import pour libs lourdes
      optimizePackageImports: ['react-icons', 'lodash'],
    },

    images: {
      // autorise le chargement d’images distantes (optimisées Next/Image)
      remotePatterns: [{ protocol: 'https', hostname: '**' }],
      formats: ['image/avif', 'image/webp'],
      dangerouslyAllowSVG: true,
      // durcit le SVG dans <Image/> (aucun script)
      contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
      unoptimized: false,
    },

    // Détend le lint en prod pour éviter les fails bloquants en phase d’itération
    eslint: { ignoreDuringBuilds: true },

    // Nettoie les console.* en prod (garde warn/error)
    compiler: {
      removeConsole: { exclude: ['error', 'warn'] },
      // reactRemoveProperties: true, // décommente si tu veux virer data-testid en prod
    },

    // 🔁 Redirects SEO — fusion produits/packs
    async redirects() {
      return [
        // Sans locale
        { source: '/produit', destination: '/products', permanent: true },
        { source: '/produit/', destination: '/products', permanent: true },
        { source: '/produit/:slug', destination: '/products/:slug', permanent: true },

        { source: '/pack', destination: '/products/packs', permanent: true },
        { source: '/pack/', destination: '/products/packs', permanent: true },
        { source: '/pack/:slug', destination: '/products/packs/:slug', permanent: true },

        // Avec préfixe de locale (next-intl)
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
        // Global
        {
          source: '/:path*',
          headers: securityHeaders,
        },
        // API – pas de cache
        {
          source: '/api/:path*',
          headers: [{ key: 'Cache-Control', value: 'no-store' }],
        },
        // Next static runtime
        {
          source: '/_next/static/:any*',
          headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
        },
        // Assets fingerprintés (CSS/JS/images/fonts)
        {
          // compatible Next 14/15 (pas de lookbehind)
          source: '/:all*.(js|css|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2)',
          headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
        },
        // Manifestes & icônes PWA
        {
          source: '/(site.webmanifest|manifest.json)',
          headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }],
        },
        {
          source: '/icons/:path*',
          headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
        },
        // Service worker
        {
          source: '/sw.js',
          headers: [
            { key: 'Service-Worker-Allowed', value: '/' },
            { key: 'Cache-Control', value: 'no-cache' },
          ],
        },
      ]
    },

    // Alias @ vers /src
    webpack: (config) => {
      config.resolve.alias['@'] = path.resolve(__dirname, 'src')
      // Optimise les connexions HTTP Node (fetch server-side)
      config.infrastructureLogging = { ...config.infrastructureLogging, level: 'error' }
      return config
    },

    // Améliore le perf des requêtes Node (SSR/ISR/fetch)
    httpAgentOptions: { keepAlive: true },
  })
)
