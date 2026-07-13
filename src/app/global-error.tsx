"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

/**
 * Global error boundary.
 *
 * File ini WAJIB ada terpisah dari error.tsx karena menangkap error
 * yang terjadi di root layout (layout.tsx) — error.tsx tidak bisa
 * menangkap error dari komponen yang membungkusnya.
 *
 * Harus merender <html> dan <body> sendiri karena layout root
 * tidak di-render saat error terjadi di level ini.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling#global-error
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, -apple-system, sans-serif",
          background: "#fff8f5",
          color: "#2b1a1f",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", padding: "2rem", maxWidth: 480 }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 600 }}>
            Terjadi kesalahan
          </h1>
          <p style={{ marginTop: "0.5rem", color: "#6b5a5f", fontSize: "0.9rem" }}>
            Maaf, terjadi error tak terduga. Tim kami sudah diberi notifikasi.
            Silakan coba lagi.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              padding: "0.625rem 1.5rem",
              borderRadius: "9999px",
              border: "none",
              background: "#e85a7a",
              color: "#fff",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            Coba lagi
          </button>
        </div>
      </body>
    </html>
  );
}
