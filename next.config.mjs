// import bundleAnalyzer from "@next/bundle-analyzer";
// const withBundleAnalyzer = bundleAnalyzer({
//   enabled: process.env.ANALYZE === "true",
// });

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
};

export default nextConfig;
// export default withBundleAnalyzer(nextConfig);
