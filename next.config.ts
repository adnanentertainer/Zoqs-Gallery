import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-hosting (e.g. GoDaddy cPanel's Node.js Selector) needs a plain
  // server.js it can hand to Passenger, plus a pruned node_modules it can
  // run without a full `npm install` on the host. `next build` emits both
  // into .next/standalone/ when this is set. Vercel ignores this option and
  // is unaffected by it.
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        // Supabase Storage public object URLs, e.g.
        // https://<project-ref>.supabase.co/storage/v1/object/public/product-images/...
        // Update this to your project's exact hostname once real credentials exist.
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    // Deliberately no Content-Security-Policy here: a restrictive CSP can
    // silently break Supabase requests, next/image, or Google Fonts, and
    // that combination hasn't been tested against a live deployment. These
    // headers are the ones that are safe to ship without that testing.
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
