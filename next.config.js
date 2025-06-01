const path = require('path');

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  exclude: [/middleware-manifest\.json$/],
});

// ✅ Ajout du plugin next-intl
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
};

// ✅ Export final avec next-intl et PWA
module.exports = nextIntl(withPWA(nextConfig));
