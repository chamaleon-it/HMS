import type { NextConfig } from "next";

// Desktop packaging still needs a static export (`npm run pack`).
// Cloudways Node runs `npm run build` and `next start`, which cannot serve `output: "export"`.
const isStaticExport = process.env.NEXT_OUTPUT === "export";

// `yarn build` sets this. Cloudways killed `next build` with exit 137 (SIGKILL)
// while the TypeScript worker started on top of the compiler. Check types with
// `yarn typecheck` instead of during the production build.
const lowMemoryBuild = process.env.SKIP_TYPECHECK === "1";

const nextConfig: NextConfig = {
  ...(isStaticExport ? { output: "export" as const } : {}),
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
