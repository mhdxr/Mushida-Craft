import * as Sentry from "@sentry/nextjs";

/**
 * Server-side Sentry initialization (Node.js runtime).
 *
 * Dipanggil dari instrumentation.ts saat Next.js startup.
 * Capture error di API routes, server components, dan server actions.
 * Jika NEXT_PUBLIC_SENTRY_DSN kosong, SDK no-op — aman untuk dev/CI.
 */
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: 1.0,

  sendDefaultPii: false,

  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
});
