import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed output: "export" to support dynamic API routes on Vercel
  // Required for dynamic images
  images: {
    unoptimized: true,
  },
  // Force webpack for production builds to avoid Turbopack CSS issues with Tailwind v3
  experimental: {},
};

export default nextConfig;