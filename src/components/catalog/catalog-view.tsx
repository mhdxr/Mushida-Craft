"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { ProductGrid } from "@/components/product/product-grid";
import {
  CatalogFilters,
  type CatalogFiltersValue,
  type PriceRange,
} from "@/components/catalog/catalog-filters";
import { EmptyState } from "@/components/catalog/empty-state";
import { categoryIds, categoryMap } from "@/data/categories";
import type { Product, ProductCategory } from "@/types";

/**
 * Rentang harga half-open di batas bawah bucket berikutnya agar
 * harga persis di boundary (300rb / 500rb / 700rb) hanya masuk satu filter.
 * - under-300:  price < 300_000
 * - 300-500:    300_000 ≤ price ≤ 500_000
 * - 500-700:    500_000 < price ≤ 700_000
 * - above-700:  price > 700_000
 */
function matchesPriceRange(price: number, range: PriceRange): boolean {
  switch (range) {
    case "all":
      return true;
    case "under-300":
      return price < 300_000;
    case "300-500":
      return price >= 300_000 && price <= 500_000;
    case "500-700":
      return price > 500_000 && price <= 700_000;
    case "above-700":
      return price > 700_000;
    default:
      return true;
  }
}

const priceLabels: Record<PriceRange, string> = {
  all: "",
  "under-300": "< Rp300rb",
  "300-500": "Rp300–500rb",
  "500-700": "Rp500–700rb",
  "above-700": "> Rp700rb",
};

const allowedCategories: ProductCategory[] = categoryIds;

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

  const products = initialProducts;

  useEffect(() => {
    const cat = searchParams.get("category") as ProductCategory | null;
    if (cat && allowedCategories.includes(cat)) {
      setFilters((f) => ({ ...f, category: cat }));
    }
  }, [searchParams]);

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return products.filter((p) => {
      if (filters.category !== "all" && p.category !== filters.category)
        return false;
      if (!matchesPriceRange(p.price, filters.price)) return false;
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
  const categoryTitle =
    filters.category !== "all"
      ? categoryMap[filters.category]?.name
      : null;

  const resetFilters = () =>
    setFilters({ search: "", category: "all", price: "all" });

  // Katalog benar-benar kosong (bukan filter ketat).
  if (products.length === 0) {
    return (
      <div className="container py-10 md:py-14">
        <CatalogHeader />
        <EmptyState
          title="Katalog sedang diperbarui"
          description="Belum ada produk yang ditampilkan. Kamu bisa request custom bouquet sementara, atau cek lagi nanti."
          primaryHref="/custom-order"
          primaryLabel="Request custom"
        />
      </div>
    );
  }

  return (
    <div className="container py-10 md:py-14">
      <CatalogHeader categoryTitle={categoryTitle} />

      <div
        ref={filtersRef}
        className="mb-8 scroll-mt-24 rounded-2xl border border-border/50 bg-white/90 p-4 shadow-sm md:p-5"
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
            <strong className="font-medium text-foreground">
              {filtered.length}
            </strong>{" "}
            produk
            {activeParts.length > 0 ? (
              <span className="text-muted-foreground">
                {" "}
                · {activeParts.join(" · ")}
              </span>
            ) : null}
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="font-medium tracking-wide text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            Reset filter
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          onReset={resetFilters}
          title="Tidak ada yang cocok"
          description="Coba ubah kata kunci, kategori, atau rentang harga — atau request custom sesuai momenmu."
          primaryHref="/custom-order"
          primaryLabel="Request custom"
        />
      ) : (
        <ProductGrid products={filtered} />
      )}

      <div className="mt-14 flex flex-col items-start justify-between gap-4 rounded-2xl border border-border/50 bg-secondary/30 px-6 py-6 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <p className="font-serif text-lg font-semibold tracking-tight">
            Belum ketemu yang pas?
          </p>
          <p className="text-sm text-muted-foreground">
            Ceritakan ide kamu — kami bantu rancang custom via WhatsApp.
          </p>
        </div>
        <Link
          href="/custom-order"
          className="group inline-flex shrink-0 items-center gap-1.5 border-b border-foreground/20 pb-0.5 text-sm font-medium tracking-wide transition-colors hover:border-primary hover:text-primary"
        >
          Custom bouquet
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}

function CatalogHeader({ categoryTitle }: { categoryTitle?: string | null }) {
  return (
    <div className="mb-10 max-w-2xl">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
        Katalog
      </p>
      <h1 className="mt-2 font-serif text-[2rem] font-medium leading-[1.15] md:text-[2.5rem]">
        {categoryTitle
          ? `Koleksi ${categoryTitle}`
          : "Jelajahi koleksi bouquet"}
      </h1>
      <p className="mt-3 max-w-xl text-[0.95rem] leading-[1.7] text-muted-foreground md:text-base">
        Snack, money, artifisial, graduation, dan satin — handmade premium.
        Filter sesuai momen dan budgetmu.
      </p>
    </div>
  );
}
