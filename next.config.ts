import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  experimental: {
    // Las Server Actions reciben la imagen en el FormData. El máximo de producto es 5 MB.
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
