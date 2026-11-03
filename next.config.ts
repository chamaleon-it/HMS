import type { NextConfig } from "next";



// `yarn build` sets this. Cloudways killed `next build` with exit 137 (SIGKILL)
// while the TypeScript worker started on top of the compiler. Check types with
// `yarn typecheck` instead of during the production build.
const lowMemoryBuild = process.env.SKIP_TYPECHECK === "1";

const nextConfig: NextConfig = {
  ...(lowMemoryBuild
    ? {
        typescript: { ignoreBuildErrors: true },
        // Default worker count is CPU count minus one, which is enough to OOM a small host.
        experimental: { cpus: 1 },
      }
    : {}),
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
