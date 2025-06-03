// next.config.js

const path = require('path')
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // désactive la PWA en dev
  exclude: [/middleware-manifest\.json$/],
})

const nextIntl = require('next-intl/plugin')('./src/i18n/request.ts')

/** @type {import('next').NextConfig} */
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
    config.resolve.alias['@'] = path.resolve(__dirname, 'src')
    return config
  },

  // ───────────────────────────────────────────────────────────
  //  Headers HTTP pour autoriser les fichiers publics (manifest, SW, icons)
  // ───────────────────────────────────────────────────────────
  headers: async () => [
    {
      source: '/(manifest.json|firebase-messaging-sw.js|icons/.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=3600, immutable',
        },
        {
          key: 'Access-Control-Allow-Origin',
          value: '*',
        },
        {
          key: 'Content-Type',
          value: 'application/json; charset=UTF-8',
        },
      ],
    },
    {
      source: '/firebase-messaging-sw.js',
      headers: [
        {
          key: 'Content-Type',
          value: 'application/javascript',
        },
      ],
    },
  ],
}

module.exports = nextIntl(withPWA(nextConfig))
