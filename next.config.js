/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["150.95.82.125", "localhost"],
  },
  assetPrefix: "/pretty-api",
  rewrites() {
    return [
      {
        source: "/pretty-api/_next/:path*",
        destination: "/_next/:path*",
      },
    ];
  },
  env: {
    server: "http://localhost:4020",
  },
};

module.exports = nextConfig;
