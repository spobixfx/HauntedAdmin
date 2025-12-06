/** @type {import('next').NextConfig} */

const nextConfig = {
  turbopack: {},
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    config.resolve.alias['design-system-src'] = false;
    return config;
  },
};

module.exports = nextConfig;



