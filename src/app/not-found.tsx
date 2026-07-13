import Link from "next/link";
import { Flower2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden">
      {/* Decorative background glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(circle at 50% 30%, rgba(255,196,213,0.4) 0%, transparent 60%)",
        }}
      />

      <div className="container relative flex flex-col items-center justify-center text-center">
        <div className="relative">
          {/* Decorative flower icon behind 404 */}
          <Flower2 className="absolute -top-8 left-1/2 h-20 w-20 -translate-x-1/2 text-primary/10" />
          <p className="relative font-serif text-8xl font-bold text-primary md:text-9xl">
            404
          </p>
        </div>

        <h1 className="mt-6 font-serif text-2xl font-semibold tracking-tight md:text-3xl">
          Halaman tidak ditemukan
        </h1>
        <p className="mt-3 max-w-md text-sm text-muted-foreground">
          Sepertinya rangkaian yang kamu cari sudah tidak ada. Yuk lihat
          koleksi bouquet lainnya yang masih tersedia.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/katalog">
              Kembali ke katalog
            </Link>
          </Button>
          <Button asChild variant="outline">
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
