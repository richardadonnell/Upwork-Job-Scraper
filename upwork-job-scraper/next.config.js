// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Enable strict mode for better error checking

  // Use static HTML export for Chrome Extension compatibility
  output: "export",

  // Remove basePath as it's not needed for Chrome extensions
  // basePath: "",

  // Ensure trailing slashes to get proper static HTML files
  trailingSlash: true,

  // Remove assetPrefix for now
  // assetPrefix: ".",

  // Optional: Set custom build output directory
  distDir: "out", // 'out' is used by default when exporting, but you can change this

  // Disable next/font optimization for Chrome extension
  optimizeFonts: false,
};

module.exports = nextConfig;
