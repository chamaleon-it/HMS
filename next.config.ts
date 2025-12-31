import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pravatar.cc"
      }
    ],
  },
};

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: false, // Enable in dev for offline testing
  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
});

export default withPWA(nextConfig);
