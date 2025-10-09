import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_OPENROUTE_API_KEY: process.env.LEAFLETMAP_API_KEY,
  },
  images: {
    domains: ['localhost', 'images.unsplash.com', 'via.placeholder.com'],
    unoptimized: true
  },
};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7 días
        },
      },
    },
  ],
})(nextConfig);
