import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "**.mysapo.net" },
      { protocol: "https", hostname: "**.sapocdn.net" },
      { protocol: "https", hostname: "bizweb.dktcdn.net" },
      { protocol: "https", hostname: "sapo.dktcdn.net" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;
