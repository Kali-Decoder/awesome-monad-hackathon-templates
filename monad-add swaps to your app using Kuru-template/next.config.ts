import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  // Add turbopack config for Next.js 16+
  turbopack: {},
};

export default nextConfig;
