/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "media.istockphoto.com",
      "www.hindustantimes.com",
      "hindustantimes.com",
    ],
  },
  // NOTE: i18n config is NOT supported in App Router.
  // Locale routing is handled via the [lng] dynamic segment instead.
};

export default nextConfig;