/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'cdn.techplay.fr',
      'images.unsplash.com',
      'source.unsplash.com',
      'res.cloudinary.com',
      'firebasestorage.googleapis.com',
    ],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    serverActions: true,
    optimizePackageImports: ['react-icons'], // ou d’autres si tu utilises shadcn/ui
  },
  i18n: {
    locales: ['fr', 'en'],
    defaultLocale: 'fr',
    localeDetection: true,
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
        { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
      ],
    },
  ],
};

module.exports = withPWA(nextConfig);
