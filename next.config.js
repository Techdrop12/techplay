import withPWA from 'next-pwa'

const isDev = process.env.NODE_ENV === 'development'

const withPwaPlugin = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: isDev
})

export default withPwaPlugin({
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ['react-icons'],
    scrollRestoration: true,
    legacyBrowsers: false
  },
  images: {
    domains: [
      'cdn.techplay.fr',
      'images.unsplash.com',
      'source.unsplash.com',
      'res.cloudinary.com',
      'firebasestorage.googleapis.com'
    ],
    formats: ['image/avif', 'image/webp']
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-DNS-Prefetch-Control', value: 'on' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' }
      ]
    }
  ]
})
