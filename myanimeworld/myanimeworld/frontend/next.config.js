/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'cdn.myanimelist.net',
      'picsum.photos',
      'api.dicebear.com',
      'img.youtube.com',
    ],
  },
};

module.exports = nextConfig;
