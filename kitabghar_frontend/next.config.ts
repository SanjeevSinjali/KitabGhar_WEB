import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pplx-res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;