/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
    ],
    // Optimize image loading
    formats: ['image/avif', 'image/webp'],
    // Cache images for 1 year
    cacheTtl: 60 * 60 * 24 * 365,
  },

  // Enable compression
  compress: true,

  // Optimize production builds
  productionBrowserSourceMaps: false,

  // Experimental features
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
    // Optimize layout shift during build
    optimizePackageImports: [
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      'lucide-react',
      'sonner',
    ],
  },

  // Headers for caching
  headers: async () => {
    return [
      {
        source: '/logo.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
