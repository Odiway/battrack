import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow cross-origin requests from local network devices
  allowedDevOrigins: [
    "http://192.168.208.210:3000",
    "http://192.168.208.*:3000",
    "http://192.168.*.*:3000",
    "http://localhost:3000",
  ],
  
  // Suppress hydration warnings for date/time differences
  reactStrictMode: true,
};

export default nextConfig;
