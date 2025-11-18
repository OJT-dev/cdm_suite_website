const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  output: process.env.NEXT_OUTPUT_MODE,
  experimental: {
    // Fix path duplication issue for Cloudflare Pages
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
    NEXT_BUILD_SKIP_DB_VALIDATION: 'true',
  },
  // Force all pages to be dynamic to avoid static generation issues
  trailingSlash: false,
  poweredByHeader: false,
  compress: true,
};

module.exports = nextConfig;
