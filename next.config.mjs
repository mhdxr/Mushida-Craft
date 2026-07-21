import { withSentryConfig } from "@sentry/nextjs";

const PRODUCT_IMAGES_BUCKET = "product-images";

const supabaseImagePattern = (() => {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || "");
    if (url.protocol !== "https:") return null;

    return {
      protocol: "https",
      hostname: url.hostname,
      port: url.port,
      pathname: `/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/**`,
      search: "",
    };
  } catch {
    return null;
  }
})();

// Host PostHog untuk reverse-proxy /ingest (same-origin → lolos CSP + ad-block).
// Override via env jika region EU: NEXT_PUBLIC_POSTHOG_INGEST_HOST / ASSETS_HOST.
const POSTHOG_INGEST_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_INGEST_HOST || "https://us.i.posthog.com";
const POSTHOG_ASSETS_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_ASSETS_HOST ||
  "https://us-assets.i.posthog.com";

/** Security headers — mirror vercel.json agar berlaku di next start / non-Vercel. */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // PostHog via /ingest same-origin; Sentry ingest + Supabase Storage di-allow.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://images.unsplash.com https://plus.unsplash.com https://*.supabase.co",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co https://*.ingest.sentry.io https://*.ingest.us.sentry.io https://*.ingest.de.sentry.io",
      "worker-src 'self' blob:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

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
      ...(supabaseImagePattern ? [supabaseImagePattern] : []),
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  /**
   * Reverse-proxy PostHog (pendekatan A).
   * Browser hanya memanggil /ingest/* (same-origin) → CSP script-src 'self' cukup.
   * @see https://posthog.com/docs/advanced/proxy/nextjs
   */
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: `${POSTHOG_ASSETS_HOST}/static/:path*`,
      },
      {
        source: "/ingest/:path*",
        destination: `${POSTHOG_INGEST_HOST}/:path*`,
      },
    ];
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
