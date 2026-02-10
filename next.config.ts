import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: false,
  output: 'standalone',
  // Skip prerendering for routes that require dynamic data
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
  },
  async headers() {
    const ContentSecurityPolicy = `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' *.stripe.com *.stripe.network js.stripe.com api.stripe.com hooks.stripe.com cdn.jsdelivr.net;
      style-src 'self' 'unsafe-inline' *.googleapis.com *.gstatic.com;
      img-src 'self' data: blob: *.stripe.com *.googleusercontent.com images.unsplash.com avatars.githubusercontent.com res.cloudinary.com i.pravatar.cc;
      font-src 'self' *.googleapis.com *.gstatic.com;
      connect-src 'self' *.supabase.co *.stripe.com api.stripe.com js.stripe.com hooks.stripe.com *.daily.co meet.jit.si;
      frame-src 'self' *.stripe.com *.stripe.network js.stripe.com hooks.stripe.com meet.jit.si *.daily.co;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'self';
      upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim();

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: ContentSecurityPolicy,
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=(self), geolocation=(self)',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
