import type { NextConfig } from "next";

// Desktop packaging still needs a static export (`npm run pack`).
// Cloudways Node runs `npm run build` and `next start`, which cannot serve `output: "export"`.
const isStaticExport = process.env.NEXT_OUTPUT === "export";

const nextConfig: NextConfig = {
  ...(isStaticExport ? { output: "export" as const } : {}),
  trailingSlash: true,
  allowedDevOrigins: ["192.168.1.100"],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pravatar.cc"
      }
    ],
  },
};



export default nextConfig;
