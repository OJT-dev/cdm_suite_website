const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  output: process.env.NEXT_OUTPUT_MODE,
  experimental: {
    // Fix: Use __dirname directly without going up a level
    // This prevents the repo/repo path duplication issue
    outputFileTracingRoot: __dirname,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: { unoptimized: true },
  // Skip database calls during static generation
  env: {
    SKIP_BUILD_STATIC_GENERATION: 'true',
  },
};

module.exports = nextConfig;
