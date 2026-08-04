import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Excel work-log uploads (Phase 2.5 import) can exceed the 1MB default.
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
