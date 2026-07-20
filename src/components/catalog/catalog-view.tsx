"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/product/product-grid";
import {
  CatalogFilters,
  type CatalogFiltersValue,
  type PriceRange,
} from "@/components/catalog/catalog-filters";
import { EmptyState } from "@/components/catalog/empty-state";
import { categoryMap } from "@/data/categories";
import type { Product, ProductCategory } from "@/types";

const priceRanges: Record<PriceRange, [number, number]> = {
  all: [0, Number.POSITIVE_INFINITY],
  "under-300": [0, 300_000],
  "300-500": [300_000, 500_000],
  "500-700": [500_000, 700_000],
  "above-700": [700_000, Number.POSITIVE_INFINITY],
};

const priceLabels: Record<PriceRange, string> = {
  all: "",
  "under-300": "≤ Rp300rb",
  "300-500": "Rp300–500rb",
  "500-700": "Rp500–700rb",
  "above-700": "≥ Rp700rb",
};

const allowedCategories: ProductCategory[] = [
  "graduation",
  "money-bouquet",
];

function buildActiveFilterSummary(filters: CatalogFiltersValue): string[] {
  const parts: string[] = [];
  if (filters.category !== "all") {
    parts.push(categoryMap[filters.category]?.name ?? filters.category);
  }
  if (filters.price !== "all") {
    parts.push(priceLabels[filters.price]);
  }
  if (filters.search.trim()) {
    parts.push(`“${filters.search.trim()}”`);
  }
  return parts;
}

interface CatalogViewProps {
  /** Produk di-fetch di server agar halaman tidak stuck "Memuat..." tanpa JS. */
  initialProducts: Product[];
}

export function CatalogView({ initialProducts }: CatalogViewProps) {
  const searchParams = useSearchParams();
  const initialCategory =
    (searchParams.get("category") as ProductCategory | null) ?? null;
  const filtersRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState<CatalogFiltersValue>({
    search: "",
    category:
      initialCategory && allowedCategories.includes(initialCategory)
        ? initialCategory
        : "all",
    price: "all",
  });

  // Data sudah dari server — tidak ada client fetch yang bisa hang.
  const products = initialProducts;

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
      if (
        q &&
        !p.name.toLowerCase().includes(q) &&
        !p.description.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [products, filters]);

  const isFiltered =
    filters.search.length > 0 ||
    filters.category !== "all" ||
    filters.price !== "all";

  const activeParts = buildActiveFilterSummary(filters);

  const scrollToFilters = () => {
    filtersRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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
          Setiap rangkaian dibuat tangan dengan bunga premium. Filter sesuai
          momen dan budget yang kamu inginkan.
        </p>
      </div>

      <div
        ref={filtersRef}
        className="mb-6 scroll-mt-24 rounded-2xl border border-border/40 bg-gradient-to-b from-white to-cream-50/80 p-4 shadow-sm md:p-5"
      >
        <CatalogFilters
          value={filters}
          onChange={setFilters}
          total={filtered.length}
        />
      </div>

      {isFiltered && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">{filtered.length}</strong> produk
            {activeParts.length > 0 ? (
              <>
                {" "}
                · {activeParts.join(" · ")}
              </>
            ) : null}
          </p>
          <button
            type="button"
            onClick={scrollToFilters}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Ubah filter
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
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
