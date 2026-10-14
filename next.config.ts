import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname),
  images: {
    unoptimized: true,
  },
  // Force webpack for production builds to avoid Turbopack CSS issues with Tailwind v3
  experimental: {},
};

export default nextConfig;