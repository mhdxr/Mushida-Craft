import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogView } from "@/components/catalog/catalog-view";
import { fetchProducts } from "@/lib/product-api";
import { products as seedProducts } from "@/data/products";
import { canonicalAlternates } from "@/lib/site";
import type { Product } from "@/types";

export const metadata: Metadata = {
  title: "Katalog Bouquet",
  description:
    "Jelajahi koleksi bouquet Mushida Craft. Filter berdasarkan kategori, harga, dan temukan rangkaian sempurna untuk momen spesialmu.",
  alternates: canonicalAlternates("/katalog"),
};

export const dynamic = "force-dynamic";

async function loadCatalogProducts(): Promise<Product[]> {
  try {
    return await fetchProducts();
  } catch {
    // Supabase belum siap / error jaringan → seed lokal agar halaman tetap isi.
    return seedProducts;
  }
}

export default async function CatalogPage() {
  const products = await loadCatalogProducts();

  return (
    <Suspense
      fallback={
        <div className="container py-10 text-sm text-muted-foreground">
          Memuat katalog...
        </div>
      }
    >
      <CatalogView initialProducts={products} />
    </Suspense>
  );
}
