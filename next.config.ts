import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "**.mysapo.net" },
      { protocol: "https", hostname: "**.sapocdn.net" },
      { protocol: "https", hostname: "bizweb.dktcdn.net" },
    ],
  },
};

export default nextConfig;
