import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogView } from "@/components/catalog/catalog-view";

export const metadata: Metadata = {
  title: "Katalog Bouquet",
  description:
    "Jelajahi koleksi bouquet bunga Mushida. Filter berdasarkan kategori, harga, dan temukan rangkaian sempurna untuk momen spesialmu.",
};

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="container py-10">Memuat...</div>}>
      <CatalogView />
    </Suspense>
  );
}
