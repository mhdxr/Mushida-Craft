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
    <div>
      {/* Banner header editorial — latar gradien tematik, tidak putih polos */}
      <div className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top_left,rgba(255,196,213,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(252,232,200,0.4),transparent_50%)] py-14 md:py-20">
        <div className="container">
          <CatalogHeader categoryTitle={categoryTitle} />
        </div>
        {/* Elemen dekoratif — bunga abstrak latar */}
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blush-100/30 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-10 left-1/3 h-48 w-48 rounded-full bg-cream-200/40 blur-2xl" />
      </div>

      <div className="container py-8 md:py-12">
        {/* Filter — tanpa kotak, menyatu dengan latar halaman */}
        <div
          ref={filtersRef}
          className="mb-8 scroll-mt-24"
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

        {/* CTA bawah — bergaya editorial, bukan kotak abu-abu */}
        <div className="mt-16 flex flex-col items-center gap-4 text-center border-t border-blush-100/60 pt-12">
          <p className="font-serif text-2xl italic text-foreground/80 md:text-3xl">
            Tidak menemukan yang pas?
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Ceritakan ide kamu — kami bantu rancang bouquet impian via WhatsApp.
          </p>
          <Link
            href="/custom-order"
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary/90 px-8 py-3 text-sm font-semibold tracking-wide text-white shadow-sm transition-all hover:bg-primary hover:scale-105"
          >
            Request Custom Bouquet
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
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
