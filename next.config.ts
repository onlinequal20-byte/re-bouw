import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output configuration for Vercel
  output: 'standalone',
  
  // Image optimization
  images: {
    domains: [],
    unoptimized: false,
  },
  
  // Experimental features
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  // Environment variables that should be available on the client
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000',
  },
};

export default nextConfig;

