import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/tech-tree',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
