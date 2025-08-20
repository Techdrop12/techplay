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
  buildExcludes: [/middleware-manifest\.json$/],
  fallbacks: { image: '/fallback.png' },
})

export default withPwaPlugin({
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
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
  eslint: { ignoreDuringBuilds: false },
  headers: async () => {
    const base = [
      { key: 'X-DNS-Prefetch-Control', value: 'on' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ]

    // ⚠️ Isolation stricte (peut bloquer Hotjar/MetaPixel). Active seulement si tu veux.
    if (process.env.NEXT_STRICT_ISOLATION === '1') {
      base.push(
        { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
      )
    }

    // En-tête hérité : on le garde derrière un flag pour éviter les warnings
    if (process.env.NEXT_ADD_EXPECT_CT === '1') {
      base.push({ key: 'Expect-CT', value: 'max-age=86400, enforce, report-uri="https://techplay.fr/csp-report"' })
    }

    return [
      // Global
      { source: '/(.*)', headers: base },
      // Caching fort sur assets Next
      {
        source: '/_next/static/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      // Caching fort sur assets publics fingerprintés
      {
        source: '/(.*)\\.(?:js|css|png|jpg|jpeg|gif|webp|svg|ico|woff2?)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ]
  },
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src')
    return config
  },
})
