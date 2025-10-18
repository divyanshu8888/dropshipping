module.exports = {
  reactStrictMode: true,
  images: {
    domains: ['example.com'], // Replace with your image domains
  },
  env: {
    STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,
    DROPSHIP_PROVIDER_API_KEY: process.env.DROPSHIP_PROVIDER_API_KEY,
  },
};