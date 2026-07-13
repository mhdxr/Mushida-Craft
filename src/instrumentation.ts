/**
 * Next.js instrumentation hook.
 *
 * Dijalankan sekali saat server startup (sebelum request pertama).
 * Digunakan untuk menginisialisasi Sentry server-side.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.server.config");
  }
}
