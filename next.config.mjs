import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  // Hanya upload source maps jika SENTRY_AUTH_TOKEN tersedia.
  // Jika tidak ada (mis. di dev/CI), plugin di-skip otomatis.
  silent: true,

  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Tree-shake logger SDK di production untuk hemat bundle size.
  // (pengganti disableLogger yang deprecated)
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },

  // Sembunyikan source map dari client (tidak di-serve publik),
  // tetap diupload ke Sentry untuk stack trace yang readable.
  hideSourceMaps: true,

  // Auto-upload source maps saat build production.
  // No-op jika SENTRY_AUTH_TOKEN tidak di-set.
  widenClientFileUpload: true,
});
