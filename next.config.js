import path from 'path';
import withPWA from 'next-pwa';

const nextPwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  exclude: [/middleware-manifest\.json$/],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...nextPwaConfig,
  reactStrictMode: true,
  experimental: {
    serverActions: {}, // ✅ fix ici
  },
  images: {
    domains: [
      'images.unsplash.com',
      'cdn.jsdelivr.net',
      'res.cloudinary.com',
      'lh3.googleusercontent.com',
      'firebasestorage.googleapis.com',
      'placehold.co',
    ],
    formats: ['image/avif', 'image/webp'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack(config) {
    config.resolve.alias['@'] = path.resolve('./src');
    return config;
  },
  headers: async () => [
    {
      source: '/(manifest\\.json|icons/.*)',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=86400, immutable' },
        { key: 'Access-Control-Allow-Origin', value: '*' },
        { key: 'Content-Type', value: 'application/json; charset=UTF-8' },
      ],
    },
    {
      source: '/sw.js',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=86400, immutable' },
        { key: 'Access-Control-Allow-Origin', value: '*' },
        { key: 'Content-Type', value: 'application/javascript' },
      ],
    },
    {
      source: '/firebase-messaging-sw.js',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=86400, immutable' },
        { key: 'Access-Control-Allow-Origin', value: '*' },
        { key: 'Content-Type', value: 'application/javascript' },
      ],
    },
  ],
};

export default nextConfig;
