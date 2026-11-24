import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Frame-Options", value: "DENY" },
        {
          key: "Permissions-Policy",
          // The voice portal needs the microphone on its own origin only.
          value: "microphone=(self), camera=(), geolocation=(self)",
        },
      ],
    },
  ],
};

export default nextConfig;
