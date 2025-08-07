// next.config.mjs
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import withPWA from 'next-pwa';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const isDev = process.env.NODE_ENV === 'development';

const withPwaPlugin = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: isDev,
  buildExcludes: [/middleware-manifest\.json$/],
  fallbacks: {
    image: '/fallback.png',
  },
});

export default withPwaPlugin({
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  experimental: {
    scrollRestoration: true,
    optimizePackageImports: ['react-icons', 'lodash'],
  },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
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
        { key: 'Expect-CT', value: 'max-age=86400, enforce, report-uri="https://techplay.fr/csp-report"' },
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    },
  ],
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  },
});
