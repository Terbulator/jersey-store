const { SECURITY_HEADERS } = require('./security-headers.cjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [320, 420, 640, 750, 828, 1080, 1200, 1400, 1920, 2560, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 640],
  },
  headers: async () => [
    {
      source: '/:path*',
      headers: SECURITY_HEADERS,
    },
    // Admin and API responses must never sit in a shared cache.
    {
      source: '/admin/:path*',
      headers: [{ key: 'Cache-Control', value: 'private, no-store, max-age=0' }],
    },
    {
      source: '/api/:path*',
      headers: [{ key: 'Cache-Control', value: 'private, no-store, max-age=0' }],
    },
    // Cache static assets aggressively
    {
      source: '/:path*.ico',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
    },
    {
      source: '/:path*.svg',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
    },
    {
      source: '/:path*.woff2',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
    },
  ],
};

module.exports = nextConfig;