import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" }, // tighten this to your actual image host(s) before going live
    ],
  },
};

export default nextConfig;
