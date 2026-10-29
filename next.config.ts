import type { NextConfig } from "next";

// Savecard is a static site. When it is published under a subpath, such as
// GitHub Pages at /savecard, set NEXT_PUBLIC_BASE_PATH to that subpath.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
