import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The site has no API routes or server actions, so it builds to plain
  // static files. That makes it droppable on any host — Netlify, Cloudflare
  // Pages, or a Korean web host — with no Node runtime needed.
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
