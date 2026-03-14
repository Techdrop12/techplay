// next.config.mjs — Next 16 clean config (next-intl + CSP + standalone + Turbopack-friendly)
import {dirname} from 'node:path'
import {fileURLToPath} from 'node:url'

import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/config.ts')

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/* -------------------------------------------------------------------------- */
/* CSP compatible GA / GTM / Meta Pixel / Hotjar / Clarity / Vercel / Sentry  */
/* -------------------------------------------------------------------------- */
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",

  [
    'script-src',
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
    'https://connect.facebook.net',
    'https://static.hotjar.com',
    'https://script.hotjar.com',
    'https://www.clarity.ms'
  ].join(' '),

  ['style-src', "'self'", "'unsafe-inline'"].join(' '),

  ['img-src', "'self'", 'data:', 'blob:', 'https:'].join(' '),

  ['font-src', "'self'", 'data:', 'https://fonts.gstatic.com'].join(' '),

  [
    'connect-src',
    "'self'",
    'https://www.google-analytics.com',
    'https://region1.google-analytics.com',
    'https://www.googletagmanager.com',
    'https://*.facebook.com',
    'https://*.hotjar.com',
    'https://vc.hotjar.io',
    'https://vars.hotjar.com',
    'https://www.clarity.ms',
    'https://*.clarity.ms',
    'https://vitals.vercel-insights.com',
    'https://*.vercel-insights.com',
    'https://*.ingest.sentry.io',
    'https://*.sentry.io',
    'https://*.google.com'
  ].join(' '),

  [
    'frame-src',
    "'self'",
    'https://www.facebook.com',
    'https://vars.hotjar.com',
    'https://www.youtube.com'
  ].join(' '),

  ['media-src', "'self'", 'data:', 'blob:', 'https:'].join(' ')
].join('; ')

/* -------------------------------------------------------------------------- */
/* Headers de sécurité globaux                                                */
/* -------------------------------------------------------------------------- */
const securityHeaders = [
  {key: 'X-DNS-Prefetch-Control', value: 'on'},
  {key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload'},
  {key: 'X-Content-Type-Options', value: 'nosniff'},
  {key: 'X-Frame-Options', value: 'DENY'},
  {key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin'},
  {key: 'Cross-Origin-Opener-Policy', value: 'same-origin'},
  {key: 'Cross-Origin-Resource-Policy', value: 'same-site'},
  {key: 'X-Permitted-Cross-Domain-Policies', value: 'none'},
  {key: 'Origin-Agent-Cluster', value: '?1'},
  {
    key: 'Permissions-Policy',
    value: [
      'accelerometer=()',
      'ambient-light-sensor=()',
      'autoplay=()',
      'battery=()',
      'camera=()',
      'cross-origin-isolated=()',
      'display-capture=()',
      'document-domain=()',
      'encrypted-media=()',
      'fullscreen=*',
      'geolocation=()',
      'gyroscope=()',
      'hid=()',
      'idle-detection=()',
      'keyboard-map=()',
      'magnetometer=()',
      'microphone=()',
      'midi=()',
      'payment=()',
      'picture-in-picture=*',
      'publickey-credentials-get=()',
      'screen-wake-lock=()',
      'usb=()',
      'web-share=()',
      'xr-spatial-tracking=()'
    ].join(', ')
  },
  {key: 'Content-Security-Policy', value: csp}
]

/* -------------------------------------------------------------------------- */
/* Config                                                                     */
/* -------------------------------------------------------------------------- */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  output: 'standalone',
  productionBrowserSourceMaps: false,

  outputFileTracingRoot: __dirname,

  experimental: {
    scrollRestoration: true,
    optimizePackageImports: [
      'react-icons',
      'lucide-react',
      'framer-motion'
    ]
  },

  images: {
    qualities: [75, 85, 88],
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    contentDispositionType: 'attachment',
    unoptimized: false,
    remotePatterns: [
      {protocol: 'https', hostname: 'fakestoreapi.com'},
      {protocol: 'https', hostname: 'images.unsplash.com'},
      {protocol: 'https', hostname: 'i.imgur.com'}
    ]
  },

  compiler: {
    removeConsole: {
      exclude: ['error', 'warn']
    }
  },

  async redirects() {
    return [
      {source: '/', destination: '/fr', permanent: false},

      {source: '/produit', destination: '/products', permanent: true},
      {source: '/produit/', destination: '/products', permanent: true},
      {source: '/produit/:slug', destination: '/products/:slug', permanent: true},

      {source: '/pack', destination: '/products/packs', permanent: true},
      {source: '/pack/', destination: '/products/packs', permanent: true},
      {source: '/pack/:slug', destination: '/products/packs/:slug', permanent: true},

      {source: '/:locale/produit', destination: '/:locale/products', permanent: true},
      {source: '/:locale/produit/', destination: '/:locale/products', permanent: true},
      {source: '/:locale/produit/:slug', destination: '/:locale/products/:slug', permanent: true},

      {source: '/:locale/pack', destination: '/:locale/products/packs', permanent: true},
      {source: '/:locale/pack/', destination: '/:locale/products/packs', permanent: true},
      {source: '/:locale/pack/:slug', destination: '/:locale/products/packs/:slug', permanent: true}
    ]
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders
      },
      {
        source: '/api/:path*',
        headers: [{key: 'Cache-Control', value: 'no-store'}]
      },
      {
        source: '/_next/static/:path*',
        headers: [{key: 'Cache-Control', value: 'public, max-age=31536000, immutable'}]
      },
      {
        source: '/:path*.(js|css|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2)',
        headers: [{key: 'Cache-Control', value: 'public, max-age=31536000, immutable'}]
      },
      {
        source: '/(site.webmanifest|manifest.json)',
        headers: [{key: 'Cache-Control', value: 'public, max-age=86400'}]
      },
      {
        source: '/icons/:path*',
        headers: [{key: 'Cache-Control', value: 'public, max-age=31536000, immutable'}]
      }
    ]
  },

  httpAgentOptions: {
    keepAlive: true
  }
}

export default withNextIntl(nextConfig)