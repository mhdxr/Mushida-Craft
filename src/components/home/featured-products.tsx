import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/product/product-grid";
import { SectionHeading } from "@/components/common/section-heading";
import { getFeaturedProducts } from "@/data/products";

export function FeaturedProducts() {
  const products = getFeaturedProducts(4);

  return (
    <section className="container py-16 md:py-24">
      <div className="flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          eyebrow="Produk Unggulan"
          title="Pilihan favorit pelanggan kami"
          description="Bouquet best-seller yang paling dicari minggu ini."
          align="left"
          className="md:max-w-xl"
        />
        <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
          <Link href="/katalog">
            Lihat semua
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="mt-10">
        <ProductGrid products={products} />
      </div>
      <div className="mt-8 flex justify-center md:hidden">
        <Button asChild variant="outline">
          <Link href="/katalog">
            Lihat semua katalog
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
