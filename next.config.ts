import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
  },
  // Force webpack for production builds to avoid Turbopack CSS issues with Tailwind v3
  experimental: {},
};

export default nextConfig;