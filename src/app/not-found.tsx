import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-serif text-7xl font-semibold text-primary">404</p>
      <h1 className="mt-4 font-serif text-2xl font-semibold tracking-tight md:text-3xl">
        Halaman tidak ditemukan
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Sepertinya rangkaian yang kamu cari sudah tidak ada. Yuk lihat
        koleksi bouquet lainnya.
      </p>
      <Button asChild className="mt-6">
        <Link href="/katalog">Kembali ke katalog</Link>
      </Button>
    </div>
  );
}
