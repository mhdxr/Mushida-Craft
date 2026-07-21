"use client";

import { useEffect } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";
import { AlertCircle, ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="relative flex min-h-[60vh] items-center justify-center overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(circle at 50% 30%, rgba(255,196,213,0.28) 0%, transparent 55%)",
        }}
      />
      <div className="container relative flex flex-col items-center py-16 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive ring-1 ring-destructive/15">
          <AlertCircle className="h-7 w-7" />
        </span>
        <h1 className="mt-5 font-serif text-2xl font-semibold tracking-tight md:text-3xl">
          Ada yang tidak beres
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          Kami mengalami sedikit kendala saat memuat halaman. Coba lagi sebentar,
          atau kembali ke beranda.
        </p>
        {error.digest ? (
          <p className="mt-2 font-mono text-[11px] text-muted-foreground/80">
            Kode: {error.digest}
          </p>
        ) : null}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button onClick={reset} className="tracking-wide">
            <RotateCcw className="h-4 w-4" />
            Coba lagi
          </Button>
          <Button asChild variant="outline" className="tracking-wide">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Ke beranda
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
