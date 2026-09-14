import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The site has no API routes or server actions, so it builds to plain
  // static files. That makes it droppable on any host — Netlify, Cloudflare
  // Pages, or a Korean web host — with no Node runtime needed.
  output: "export",
  images: { unoptimized: true },
  // `next dev` only: lets a phone on the same Wi-Fi load the dev server by
  // the PC's address. Without it the page arrives but its scripts are
  // refused (403), so nothing on it moves. One segment per `*`.
  allowedDevOrigins: ["172.30.1.*", "192.168.*.*"],
};

export default nextConfig;
