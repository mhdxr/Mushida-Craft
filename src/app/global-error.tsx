"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

/**
 * Global error boundary (root layout).
 * Harus merender <html> + <body> sendiri.
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
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
          background: "#fff8f5",
          color: "#2b1a1f",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", padding: "2rem", maxWidth: 440 }}>
          <div
            style={{
              width: 64,
              height: 64,
              margin: "0 auto",
              borderRadius: "9999px",
              background: "rgba(232, 90, 122, 0.12)",
              color: "#e85a7a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 700,
            }}
            aria-hidden
          >
            !
          </div>
          <h1
            style={{
              marginTop: "1.25rem",
              fontSize: "1.75rem",
              fontWeight: 600,
              letterSpacing: "-0.02em",
            }}
          >
            Terjadi kesalahan
          </h1>
          <p
            style={{
              marginTop: "0.6rem",
              color: "#6b5a5f",
              fontSize: "0.9rem",
              lineHeight: 1.55,
            }}
          >
            Maaf, terjadi error tak terduga. Silakan coba muat ulang halaman.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              padding: "0.7rem 1.6rem",
              borderRadius: "9999px",
              border: "none",
              background: "#e85a7a",
              color: "#fff",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer",
              letterSpacing: "0.02em",
            }}
          >
            Coba lagi
          </button>
        </div>
      </body>
    </html>
  );
}
