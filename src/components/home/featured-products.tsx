import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ProductGrid } from "@/components/product/product-grid";
import { SectionHeading } from "@/components/common/section-heading";
import { fetchFeaturedProducts } from "@/lib/product-api";
import { getFeaturedProducts } from "@/data/products";

export async function FeaturedProducts() {
  let products = [];
  try {
    products = await fetchFeaturedProducts(4);
  } catch {
    products = getFeaturedProducts(4);
  }

  // Jangan tampilkan heading kosong bila tidak ada produk.
  if (products.length === 0) return null;

  return (
    <section className="container py-16 md:py-24">
      <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-end md:gap-8">
        <SectionHeading
          eyebrow="Koleksi unggulan"
          title="Pilihan yang paling dicari"
          description="Rangkaian best-seller dengan sentuhan personal untuk momen spesial."
          align="left"
          className="md:max-w-xl"
        />
        <Link
          href="/katalog"
          className="group inline-flex shrink-0 items-center gap-1.5 border-b border-foreground/20 pb-0.5 text-sm font-medium tracking-wide text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          Lihat semua
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </div>
      <div className="mt-12 md:mt-14">
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
