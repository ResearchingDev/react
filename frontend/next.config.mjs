/** @type {import('next').NextConfig} */
const nextConfig = {
    publicRuntimeConfig: {
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL, // Fetch the API base URL from the environment variable
    },
  };
  
  export default nextConfig;