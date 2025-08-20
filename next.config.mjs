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
  disable: isDev, // désactive le SW en dev
  buildExcludes: [/middleware-manifest\.json$/],
  fallbacks: { image: '/fallback.png' },
})

export default withPwaPlugin({
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  experimental: {
    scrollRestoration: true,
    // optimizePackageImports: ['react-icons', 'lodash'],
  },

  // ✅ Liste explicite des domaines d’images autorisés (évite hostname: '**')
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'fakestoreapi.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'cdn.shopify.com' },
      { protocol: 'https', hostname: 'i.imgur.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: false, // laisse l’optimisation Next/Image activée
  },

  // Évite que le build casse à cause du lint en CI
  eslint: { ignoreDuringBuilds: true },

  // Headers de sécu et de cache
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
      source: '/:all*.(js|css|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2)',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
    },
  ],

  // Alias @ → src
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src')
    return config
  },
})
