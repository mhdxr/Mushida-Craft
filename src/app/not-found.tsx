import Link from "next/link";
import { ArrowLeft, Flower2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(circle at 50% 28%, rgba(255,196,213,0.42) 0%, transparent 58%), radial-gradient(circle at 80% 80%, rgba(252,232,200,0.35) 0%, transparent 45%)",
        }}
      />

      <div className="container relative flex flex-col items-center justify-center py-16 text-center">
        <div className="relative">
          <Flower2
            className="absolute -top-7 left-1/2 h-16 w-16 -translate-x-1/2 text-primary/15"
            aria-hidden
          />
          <p className="relative font-serif text-8xl font-bold tracking-tight text-primary/90 md:text-9xl">
            404
          </p>
        </div>

        <h1 className="mt-6 font-serif text-2xl font-semibold tracking-tight md:text-3xl">
          Halaman tidak ditemukan
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          Sepertinya rangkaian yang kamu cari sudah tidak ada. Lihat koleksi
          bouquet lain yang masih tersedia, atau minta custom.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild className="tracking-wide">
            <Link href="/katalog">Ke katalog</Link>
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
