/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_OPENROUTE_API_KEY: process.env.LEAFLETMAP_API_KEY,
  },
};

export default nextConfig;
