/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // Suppress pdfjs-dist canvas warnings - mark as external
  serverExternalPackages: ["pdfjs-dist"],
  // Empty turbopack config to silence webpack warning
  turbopack: {},
};

export default nextConfig;
