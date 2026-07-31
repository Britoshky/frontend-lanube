import type { NextConfig } from "next";

/** Backend FastAPI (Coolify usa BACKEND_INTERNAL_URL; fallback LAN ai-server). */
const backendApiBase =
  process.env.BACKEND_INTERNAL_URL?.replace(/\/$/, "") ||
  "http://192.168.30.254:4003/api/v1";

const nextConfig: NextConfig = {
  async rewrites() {
    const base = backendApiBase.replace(/\/api\/v1$/, "");
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendApiBase}/:path*`,
      },
      {
        source: "/media/:path*",
        destination: `${base}/media/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
