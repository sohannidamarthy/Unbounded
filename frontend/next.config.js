const { PHASE_DEVELOPMENT_SERVER } = require("next/constants");

module.exports = (phase) => {
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    reactStrictMode: true,
    distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next",
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "logo.clearbit.com"
        },
        {
          protocol: "https",
          hostname: "www.google.com",
          pathname: "/s2/favicons"
        }
      ]
    },
    async headers() {
      if (process.env.NODE_ENV !== "development") {
        return [];
      }
      return [
        {
          source: "/:path*",
          headers: [
            {
              key: "Cache-Control",
              value: "no-store, no-cache, must-revalidate, proxy-revalidate"
            }
          ]
        },
        {
          source: "/_next/:path*",
          headers: [
            {
              key: "Cache-Control",
              value: "no-store, no-cache, must-revalidate, proxy-revalidate"
            }
          ]
        }
      ];
    }
  };

  return nextConfig;
};
