/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_POLLING_INTERVAL: process.env.POLLING_INTERVAL,
    NEXT_PUBLIC_EXPLORER_API_URL: process.env.EXPLORER_API_URL,
  },
  logging: {
    fetches: {
      fullUrl: true,
      hmrRefreshes: true,
    },
  },
  compiler: {
    styledComponents: true,
  },
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
};

export default nextConfig;
