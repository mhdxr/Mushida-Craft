import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/product/product-grid";
import { SectionHeading } from "@/components/common/section-heading";
import { fetchFeaturedProducts } from "@/lib/product-api";
import { featuredCategoryLabels } from "@/data/products";
import type { Product } from "@/types";

/**
 * Produk unggulan = isi database saja (1 per kategori yang ada di DB).
 * Tidak fallback ke seed statis — biar beranda selaras admin/katalog.
 */
export async function FeaturedProducts() {
  let products: Product[] = [];
  let loadError = false;

  try {
    products = await fetchFeaturedProducts();
  } catch (err) {
    loadError = true;
    console.error("FeaturedProducts: gagal load dari Supabase", err);
  }

  if (products.length === 0) {
    return (
      <section className="container py-16 md:py-24">
        <SectionHeading
          eyebrow="Produk Unggulan"
          title="Pilihan dari setiap kategori"
          description={
            loadError
              ? "Katalog belum bisa dimuat. Coba refresh sebentar lagi."
              : "Belum ada produk di database. Tambah lewat admin agar tampil di sini."
          }
          align="left"
          className="md:max-w-xl"
        />
        <div className="mt-8">
          <Button asChild variant="outline">
            <Link href="/katalog">Lihat katalog</Link>
          </Button>
        </div>
      </section>
    );
  }

  const labels = featuredCategoryLabels(products);
  const description =
    labels.length === 1
      ? `Unggulan dari kategori ${labels[0]} di katalog kami.`
      : `Satu pilihan dari setiap kategori di katalog: ${labels.join(", ")}.`;

  return (
    <section className="container py-16 md:py-24">
      <div className="flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          eyebrow="Produk Unggulan"
          title="Pilihan dari setiap kategori"
          description={description}
          align="left"
          className="md:max-w-xl"
        />
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="hidden md:inline-flex"
        >
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
