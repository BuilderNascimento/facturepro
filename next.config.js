/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['puppeteer-core', '@sparticuz/chromium'],
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;
