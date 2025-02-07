import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint:{
    ignoreDuringBuilds:true
  },
  serverActions: {
    bodySizeLimit: '2mb',
  },
};

export default nextConfig;
