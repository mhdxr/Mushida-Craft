import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogView } from "@/components/catalog/catalog-view";
import CatalogLoading from "@/app/katalog/loading";
import { fetchProducts } from "@/lib/product-api";
import { products as seedProducts } from "@/data/products";
import { canonicalAlternates } from "@/lib/site";
import type { Product } from "@/types";

export const metadata: Metadata = {
  title: "Katalog Bouquet",
  description:
    "Jelajahi koleksi bouquet handmade Mushida Craft — snack, money, artifisial, graduation, dan satin. Filter kategori & budget.",
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
    <Suspense fallback={<CatalogLoading />}>
      <CatalogView initialProducts={products} />
    </Suspense>
  );
}
