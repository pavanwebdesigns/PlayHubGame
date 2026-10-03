import type { NextConfig } from 'next';
import { shortBuildId } from './lib/build-id';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  generateBuildId: () => shortBuildId(),
  images: {
    loader: 'custom',
    loaderFile: './lib/gamepix-loader.ts',
  },
};

export default nextConfig;
