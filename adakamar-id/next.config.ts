import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/login",
        destination: "/masuk",
      },
      {
        source: "/forgot-password",
        destination: "/lupa-kata-sandi",
      },
      {
        source: "/reset-password",
        destination: "/atur-ulang-kata-sandi",
      },
      {
        source: "/admin/dashboard",
        destination: "/admin",
      },
      {
        source: "/penulis/dashboard",
        destination: "/kurator",
      },
      {
        source: "/penulis",
        destination: "/kurator",
      },
      {
        source: "/penulis/:path*",
        destination: "/kurator/:path*",
      },
    ];
  },
};

export default nextConfig;
