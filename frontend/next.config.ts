import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["localhost"], // ← ← ← ここがポイント！
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/hold-extraction",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
