// next.config.mjs
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import withPWA from 'next-pwa'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const isDev = process.env.NODE_ENV === 'development'

const withPwaPlugin = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: isDev,

  // Evite d’inclure des manifests internes au precache
  buildExcludes: [/middleware-manifest\.json$/],

  // Fallback image
  fallbacks: { image: '/fallback.png' },

  // 🚫 Couper le module Workbox "offlineGoogleAnalytics" (source d’alertes)
  // (nom d’option selon la version : on met les 2 clés par sécurité)
  workboxOptions: { offlineGoogleAnalytics: false },
  workboxOpts: { offlineGoogleAnalytics: false },
})

export default withPwaPlugin({
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  experimental: {
    scrollRestoration: true,
    // (Tu peux réactiver optimizePackageImports plus tard si besoin)
    // optimizePackageImports: ['react-icons', 'lodash'],
  },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: false,
  },

  // On évite de casser le build à cause de lint en prod
  eslint: { ignoreDuringBuilds: true },

  headers: async () => [
    {
      source: '/:path*',
      headers: [
        { key: 'X-DNS-Prefetch-Control', value: 'on' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    },
    {
      source: '/_next/static/:any*',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
    },
    {
      // ✅ Pattern compatible Next 15
      source: '/:all*.(js|css|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2)',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
    },
  ],

  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src')
    return config
  },
})
