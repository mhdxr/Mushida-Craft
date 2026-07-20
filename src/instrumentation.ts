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
    // Guard kredensial admin di production (password lemah/default/kosong).
    const { assertProductionAdminCredentials } = await import(
      "@/lib/admin-credentials"
    );
    assertProductionAdminCredentials();

    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.server.config");
  }
}
