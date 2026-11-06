import type { NextConfig } from "next";

// Static export: `npm run build` writes a plain website to the `out` folder,
// which Netlify (or any static host) can serve directly.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
