// next.config.js or next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
    // reactStrictMode: true,
    // Configure environment variables
    env: {
      NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/',
    },
    images: {
      domains: ['localhost'],
    },
  };
  
  export default nextConfig;
  