import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  basePath: '/investment-tech-tree',
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ensure API routes work properly
  async rewrites() {
    return [
      {
        source: '/investment-tech-tree/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};

export default nextConfig;