// 📁 /next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true,
  },
  i18n: {
    locales: ['fr', 'en'],
    defaultLocale: 'fr',
  },
}

module.exports = nextConfig
