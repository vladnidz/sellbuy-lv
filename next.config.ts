import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use static export - reliable on Vercel, no serverless function issues
  output: "export",
  // Required for static export with images
  images: {
    unoptimized: true,
  },
  // Force webpack for production builds to avoid Turbopack CSS issues with Tailwind v3
  experimental: {
    turbo: false,
  },
};

export default nextConfig;