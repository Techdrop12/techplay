/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {}, // ✅ App Router compatible
  },
  i18n: {
    locales: ['fr', 'en'],
    defaultLocale: 'fr',
    localeDetection: true, // ✅ boolean (et plus 'false' en string)
  },
  images: {
    domains: [
      'res.cloudinary.com',
      'images.unsplash.com',
      'cdn.tecplay.io',
      'source.unsplash.com',
    ],
  },
  reactStrictMode: true,
};

export default nextConfig;
