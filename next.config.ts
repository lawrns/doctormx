import type { NextConfig } from "next";

// Bundle analyzer - only enabled when ANALYZE=true
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: 'standalone',
  // Bundle optimization settings
  webpack: (config, { isServer }) => {
    // Optimize chunk splitting for client bundles
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Vendor chunk for node_modules
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
            // Separate chunk for heavy animation libraries
            framerMotion: {
              test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
              name: 'framer-motion',
              chunks: 'all',
              priority: 20,
            },
            // Separate chunk for chart libraries
            recharts: {
              test: /[\\/]node_modules[\\/]recharts[\\/]/,
              name: 'recharts',
              chunks: 'all',
              priority: 20,
            },
            // Separate chunk for PDF libraries (client-side only)
            pdfkit: {
              test: /[\\/]node_modules[\\/]pdfkit[\\/]/,
              name: 'pdfkit',
              chunks: 'all',
              priority: 20,
            },
            // Separate chunk for AI/ML libraries
            ai: {
              test: /[\\/]node_modules[\\/](@anthropic-ai|openai|@xstate)[\\/]/,
              name: 'ai-libraries',
              chunks: 'all',
              priority: 15,
            },
            // Common UI components
            ui: {
              test: /[\\/]src[\\/]components[\\/]ui[\\/]/,
              name: 'ui-components',
              chunks: 'all',
              priority: 5,
            },
          },
        },
      };
    }
    return config;
  },
  // Turbopack configuration
  turbopack: {},
  // Skip prerendering for routes that require dynamic data
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Optimize package imports for common libraries
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      'recharts',
      '@radix-ui/react-icons',
    ],
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

export default withBundleAnalyzer(nextConfig);
