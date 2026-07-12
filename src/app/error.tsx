"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle className="h-7 w-7" />
      </span>
      <h1 className="mt-4 font-serif text-2xl font-semibold tracking-tight md:text-3xl">
        Oops, ada yang salah
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Kami mengalami sedikit kendala saat memuat halaman. Silakan coba lagi
        sebentar atau kembali ke beranda.
      </p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset}>Coba lagi</Button>
        <Button asChild variant="outline">
          <a href="/">Ke Beranda</a>
        </Button>
      </div>
    </div>
  );
}
