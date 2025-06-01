// next.config.js
const path = require('path');

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  exclude: [/middleware-manifest\.json$/],
});

const nextIntl = require('next-intl/plugin')('./next-intl.config.js');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  images: {
    domains: [
      'images.unsplash.com',
      'cdn.jsdelivr.net',
      'res.cloudinary.com',
      'lh3.googleusercontent.com',
      'firebasestorage.googleapis.com',
      'placehold.co',
    ],
    formats: ['image/webp'],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  },

  headers: async () => [
    {
      // 👇 Cache et rend les fichiers PWA accessibles publiquement
      source: '/(manifest.json|logo.png|firebase-messaging-sw.js|icons/.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=3600',
        },
      ],
    },
  ],
};

module.exports = nextIntl(withPWA(nextConfig));
