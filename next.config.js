/** @type {import('next').NextConfig} */
const pkg = require('next-pwa'); // ← Correction ici (import par défaut CommonJS)
const withPWA = pkg({
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
    optimizePackageImports: ['react-icons'],
  },
  i18n: {
    locales: ['fr', 'en'],
    defaultLocale: 'fr',
    localeDetection: true,
  },
  headers: async () => [
    // ...tes headers ici
  ],
};

module.exports = withPWA(nextConfig);
