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
  //  HEADERS HTTP POUR LES FICHIERS PUBLICS
  // ───────────────────────────────────────────────────────────
  headers: async () => [
    // 1) manifest.json et tout ce qui est dans /icons/...
    {
      source: '/(manifest.json|icons/.*)',
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
    // 2) firebase-messaging-sw.js → on s’assure d’un content-type correct
    {
      source: '/firebase-messaging-sw.js',
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
          value: 'application/javascript',
        },
      ],
    },
  ],
}

module.exports = nextIntl(withPWA(nextConfig))
