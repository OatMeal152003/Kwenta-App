import withSerwist from "@serwist/next";

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withSerwist({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  reloadOnOnline: true,
})(nextConfig);
