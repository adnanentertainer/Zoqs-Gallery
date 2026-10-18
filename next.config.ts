import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-hosting (e.g. GoDaddy cPanel's Node.js Selector) needs a plain
  // server.js it can hand to Passenger, plus a pruned node_modules it can
  // run without a full `npm install` on the host. `next build` emits both
  // into .next/standalone/ when this is set. Vercel ignores this option and
  // is unaffected by it.
  output: "standalone",
  // @ffmpeg-installer/ffmpeg resolves its platform binary with a runtime
  // require() whose path depends on which of 3 candidate locations exists
  // on disk -- webpack's Server Components bundling tries to statically
  // resolve all 3 require() branches at build time and fails on the ones
  // that don't exist, even though they're guarded by a runtime fs check.
  // Opting the package out of bundling (plain Node `require` instead) is
  // Next's documented fix for exactly this shape of native/platform
  // dependency; see src/lib/tiktok/videoGenerator.ts.
  serverExternalPackages: ["@ffmpeg-installer/ffmpeg"],
  // The TikTok auto-poster renders each product photo into a short video
  // with the @ffmpeg-installer/ffmpeg binary (src/lib/tiktok/videoGenerator.ts),
  // invoked from Server Actions (product create/update) and from the
  // /api/cron/social-repost route -- not one single route file. Next's file
  // tracing only follows require()/import() calls, not the dynamic fs path
  // that package resolves its binary from, so without this the binary is
  // silently dropped from whichever server bundle ends up calling it and
  // the deployed function 404s on ffmpeg at runtime. '/*' (same pattern
  // Next's own docs use for sharp/aws-crt) keeps this correct regardless of
  // which bundle ends up invoking it, rather than chasing every call site.
  outputFileTracingIncludes: {
    "/*": ["./node_modules/@ffmpeg-installer/**/*"],
  },
  images: {
    // Cloudinary and Supabase Storage already serve pre-sized/pre-optimized
    // images, so routing them through Vercel's Image Optimization too is
    // redundant re-processing that counts against the (tight, easy-to-blow-
    // through-on-Hobby) image optimization quota for no real benefit.
    unoptimized: true,
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
      {
        // Cloudinary-hosted product photos, e.g.
        // https://res.cloudinary.com/<cloud-name>/image/upload/v.../file.jpg
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
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
