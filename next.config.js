// next.config.js
const path = require('path');
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  exclude: [/middleware-manifest\.json$/]
});

const nextIntl = require('next-intl/plugin')('./src/i18n/request.ts');

module.exports = nextIntl(
  withPWA({
    reactStrictMode: true,

    images: {
      domains: [
        'images.unsplash.com',
        'cdn.jsdelivr.net',
        'res.cloudinary.com',
        'lh3.googleusercontent.com',
        'firebasestorage.googleapis.com',
        'placehold.co'
      ],
      formats: ['image/webp']
    },

    eslint: { ignoreDuringBuilds: true },

    typescript: { ignoreBuildErrors: true },

    webpack: (config) => {
      config.resolve.alias['@'] = path.resolve(__dirname, 'src');
      return config;
    },

    headers: async () => [
      {
        source: '/(manifest\\.json|icons/.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, immutable' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Content-Type', value: 'application/json; charset=UTF-8' }
        ]
      },
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, immutable' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Content-Type', value: 'application/javascript' }
        ]
      },
      {
        source: '/firebase-messaging-sw.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, immutable' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Content-Type', value: 'application/javascript' }
        ]
      }
    ],
  })
);
