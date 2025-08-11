import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["localhost"], // ← ← ← ここがポイント！
  },
};

export default nextConfig;
