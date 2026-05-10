import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.0.136", 
    "localhost:3000", 
    "18d6-1-228-99-61.ngrok-free.app"
  ],
};

export default nextConfig;