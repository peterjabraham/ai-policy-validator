/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // Empty turbopack config to silence webpack warning
  turbopack: {},
};

export default nextConfig;
