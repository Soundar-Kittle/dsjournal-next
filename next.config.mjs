const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  experimental: {
    serverSourceMaps: true,
    optimizePackageImports: ["moment"],
  },
  productionBrowserSourceMaps: false,
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "/api/uploads/:path*",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/uploads/:path*.pdf",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "index, follow",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/upload/:path*",
        destination: "/uploads/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
