import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "172.20.10.2",
    "10.24.249.200" // adresse ip partage de connexion helios
  ],
};

export default nextConfig;
