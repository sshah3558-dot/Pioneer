import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // Ensure NEXTAUTH_URL is always available during static generation.
    // Falls back to Vercel's auto-provided URL, then localhost for dev.
    NEXTAUTH_URL:
      process.env.NEXTAUTH_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000"),
  },
};

export default nextConfig;
