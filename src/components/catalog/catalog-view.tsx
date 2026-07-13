"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/product/product-grid";
import {
  CatalogFilters,
  type CatalogFiltersValue,
  type PriceRange,
} from "@/components/catalog/catalog-filters";
import { EmptyState } from "@/components/catalog/empty-state";
import { useProducts } from "@/hooks/use-products";
import type { ProductCategory } from "@/types";

const priceRanges: Record<PriceRange, [number, number]> = {
  all: [0, Number.POSITIVE_INFINITY],
  "under-300": [0, 300_000],
  "300-500": [300_000, 500_000],
  "500-700": [500_000, 700_000],
  "above-700": [700_000, Number.POSITIVE_INFINITY],
};

const allowedCategories: ProductCategory[] = [
  "hand-bouquet",
  "wedding",
  "graduation",
  "anniversary",
  "money-bouquet",
  "dried-flower",
];

export function CatalogView() {
  const searchParams = useSearchParams();
  const initialCategory =
    (searchParams.get("category") as ProductCategory | null) ?? null;

  const [filters, setFilters] = useState<CatalogFiltersValue>({
    search: "",
    category:
      initialCategory && allowedCategories.includes(initialCategory)
        ? initialCategory
        : "all",
    price: "all",
  });

  const { products, isLoading } = useProducts();

  useEffect(() => {
    const cat = searchParams.get("category") as ProductCategory | null;
    if (cat && allowedCategories.includes(cat)) {
      setFilters((f) => ({ ...f, category: cat }));
    }
  }, [searchParams]);

  const filtered = useMemo(() => {
    const [min, max] = priceRanges[filters.price];
    const q = filters.search.trim().toLowerCase();
    return products.filter((p) => {
      if (filters.category !== "all" && p.category !== filters.category)
        return false;
      if (p.price < min || p.price > max) return false;
      if (q && !p.name.toLowerCase().includes(q) &&
          !p.description.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [products, filters]);

  return (
    <div className="container py-10 md:py-14">
      <div className="mb-10 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Katalog
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight md:text-4xl">
          Jelajahi koleksi bouquet kami
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          Setiap rangkaian dibuat tangan dengan bunga premium.
          Filter sesuai momen dan budget yang kamu inginkan.
        </p>
      </div>

      <div className="sticky top-16 z-30 -mx-4 mb-8 border-b border-border/40 bg-background/85 px-4 py-4 backdrop-blur-md md:static md:mx-0 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
        <CatalogFilters
          value={filters}
          onChange={setFilters}
          total={filtered.length}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm"
            >
              <div className="aspect-[4/5] animate-pulse bg-secondary" />
              <div className="space-y-2 p-4">
                <div className="h-2.5 w-16 animate-pulse rounded bg-secondary" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-secondary" />
                <div className="h-4 w-1/3 animate-pulse rounded bg-secondary" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          onReset={() =>
            setFilters({ search: "", category: "all", price: "all" })
          }
        />
      ) : (
        <ProductGrid products={filtered} />
      )}
    </div>
  );
}
