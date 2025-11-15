import bundleAnalyzer from "@next/bundle-analyzer";
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = {
  reactStrictMode: false,
  // compiler: {
  //   removeConsole: process.env.NODE_ENV === "production",
  // },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverSourceMaps: true,
    optimizePackageImports: ["moment"],
  },
  productionBrowserSourceMaps: false,
  webpack: (config) => {
    config.parallelism = 1;

    config.optimization.splitChunks = {
      chunks: "all",
      minSize: 20000,
      maxSize: 244000,
      cacheGroups: {
        default: {
          minChunks: 1,
          priority: -20,
          reuseExistingChunk: true,
        },
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true,
        },
      },
    };

    return config;
  },
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "/api/uploads/:path*",
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
