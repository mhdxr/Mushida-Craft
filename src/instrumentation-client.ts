import * as Sentry from "@sentry/nextjs";

/**
 * Client-side Sentry initialization.
 *
 * Dipanggil otomatis oleh Next.js (instrumentation-client.ts).
 * Jika NEXT_PUBLIC_SENTRY_DSN kosong, SDK no-op (tidak mengirim apa-apa)
 * — aman untuk dev/CI/preview.
 *
 * File ini menggantikan sentry.client.config.ts yang deprecated di Next 16+
 * (khususnya untuk kompatibilitas Turbopack).
 */
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Sesuaikan sample rate sesuai traffic:
  // 1.0 di dev (semua trace), 0.1 di production untuk menghemat quota.
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Hilangkan data request body default (bisa mengandung input form/password).
  // Sentry sudah mask header sensitif secara default.
  sendDefaultPii: false,

  // Hanya aktif di environment yang punya DSN.
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
});

// Instrumentasi navigasi untuk Sentry (Next.js 16 Turbopack).
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
