import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: "/",
        destination: "/productOrder",
        permanent: true, // or false if it's temporary
      },
    ];
  },
};

export default nextConfig;
