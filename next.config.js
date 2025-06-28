/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    domains: [
      'cdn.techplay.fr',
      'images.unsplash.com',
      'res.cloudinary.com',
      'firebasestorage.googleapis.com'
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [320, 420, 640, 768, 1024, 1200, 1600],
    minimumCacheTTL: 60
  },
  i18n: {
    locales: ['fr', 'en'],
    defaultLocale: 'fr'
  },
  experimental: {
    serverActions: true,
    turbo: true,
    serverComponentsExternalPackages: ['mongoose', 'bcryptjs', 'stripe']
  },
  async rewrites() {
    return [
      { source: '/sitemap.xml', destination: '/api/sitemap' },
      { source: '/rss.xml', destination: '/api/rss' },
      { source: '/robots.txt', destination: '/api/robots' }
    ];
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' }
      ]
    }
  ]
};

module.exports = nextConfig;
