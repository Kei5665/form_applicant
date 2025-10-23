import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Vercelで自動的にAVIF/WebP形式に変換
    formats: ['image/avif', 'image/webp'],
    // レスポンシブ画像のデバイスサイズ
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // 画像キャッシュの最小TTL（秒）
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.microcms-assets.io',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
