import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/app", destination: "/dashboard", permanent: true },
      { source: "/app/records", destination: "/records", permanent: true },
      { source: "/app/records/:path*", destination: "/records/:path*", permanent: true },
      { source: "/app/contacts", destination: "/contacts", permanent: true },
      { source: "/app/contacts/:path*", destination: "/contacts/:path*", permanent: true },
      { source: "/app/reminders", destination: "/reminders", permanent: true },
      { source: "/app/reminders/:path*", destination: "/reminders/:path*", permanent: true },
      { source: "/app/paluwagan", destination: "/paluwagan", permanent: true },
      { source: "/app/paluwagan/:path*", destination: "/paluwagan/:path*", permanent: true },
      { source: "/app/settings", destination: "/settings", permanent: true },
      { source: "/app/settings/:path*", destination: "/settings/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
