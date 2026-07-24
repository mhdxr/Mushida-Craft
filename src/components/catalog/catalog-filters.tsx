"use client";

import { useEffect, useState } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories as seedCategories } from "@/data/categories";
import { cn } from "@/lib/utils";
import type { ProductCategory } from "@/types";

export type PriceRange =
  | "all"
  | "under-300"
  | "300-500"
  | "500-700"
  | "above-700";

export interface CatalogFiltersValue {
  search: string;
  category: ProductCategory | "all";
  price: PriceRange;
}

interface CatalogFiltersProps {
  value: CatalogFiltersValue;
  onChange: (value: CatalogFiltersValue) => void;
  total: number;
}

const priceOptions: { value: PriceRange; label: string }[] = [
  { value: "all", label: "Semua harga" },
  { value: "under-300", label: "Di bawah Rp300.000" },
  { value: "300-500", label: "Rp300.000 – Rp500.000" },
  { value: "500-700", label: "Di atas Rp500.000 – Rp700.000" },
  { value: "above-700", label: "Di atas Rp700.000" },
];

export function CatalogFilters({
  value,
  onChange,
  total,
}: CatalogFiltersProps) {
  // Seed dulu; ganti dari API bila tersedia (nama kategori editable di admin).
  const [categoryChips, setCategoryChips] = useState<
    { id: ProductCategory | "all"; name: string }[]
  >([
    { id: "all", name: "Semua" },
    ...seedCategories.map((c) => ({ id: c.id, name: c.name })),
  ]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/categories", { cache: "no-store" });
        const json = await res.json();
        if (!active || !json?.ok || !Array.isArray(json.categories)) return;
        if (json.categories.length === 0) return;
        setCategoryChips([
          { id: "all", name: "Semua" },
          ...json.categories.map(
            (c: { id: ProductCategory; name: string }) => ({
              id: c.id,
              name: c.name,
            }),
          ),
        ]);
      } catch {
        // keep seed
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const isFiltered =
    value.search.length > 0 ||
    value.category !== "all" ||
    value.price !== "all";

  return (
    <div className="space-y-6">
      <div className="relative max-w-xl mx-auto md:mx-0">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/40" />
        <Input
          placeholder="Cari nama atau jenis bouquet..."
          aria-label="Cari bouquet"
          value={value.search}
          onChange={(e) => onChange({ ...value, search: e.target.value })}
          className="h-12 rounded-full border-blush-200/50 bg-white/70 pl-11 pr-4 shadow-[0_2px_12px_-4px_rgba(255,196,213,0.15)] focus-visible:ring-primary/20 focus-visible:bg-white backdrop-blur-sm transition-all hover:bg-white"
        />
      </div>

      {/* Chip kategori — elegan, melayang halus */}
      <div
        className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-2 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="listbox"
        aria-label="Filter kategori"
      >
        {categoryChips.map((chip) => {
          const active = value.category === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              role="option"
              aria-selected={active}
              onClick={() =>
                onChange({
                  ...value,
                  category: chip.id,
                })
              }
              className={cn(
                "inline-flex shrink-0 items-center rounded-full px-5 py-2.5 text-[13px] font-medium tracking-wide transition-all duration-300",
                active
                  ? "bg-primary text-white shadow-[0_4px_12px_-2px_rgba(255,196,213,0.6)] scale-[1.02]"
                  : "bg-white/80 border border-blush-100/60 text-muted-foreground hover:bg-white hover:text-foreground hover:border-primary/30 hover:shadow-sm"
              )}
            >
              {chip.name}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <div className="flex min-w-0 flex-wrap items-center gap-4">
          <Select
            value={value.price}
            onValueChange={(v) =>
              onChange({ ...value, price: v as PriceRange })
            }
          >
            <SelectTrigger
              className="h-10 w-auto min-w-[11rem] rounded-full border-blush-200/50 bg-white/80 px-4 text-xs md:min-w-[13.5rem] md:text-sm hover:bg-white hover:border-primary/30 transition-colors shadow-sm"
              aria-label="Filter harga"
            >
              <SlidersHorizontal className="mr-2 h-3.5 w-3.5 text-primary/50" />
              <SelectValue placeholder="Rentang harga" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-blush-100/60 shadow-lg">
              {priceOptions.map((p) => (
                <SelectItem key={p.value} value={p.value} className="rounded-lg hover:bg-blush-50 cursor-pointer">
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <p className="text-[13px] text-muted-foreground/80 hidden sm:block">
            <strong className="font-serif text-base italic font-semibold text-foreground/90">{total}</strong>{" "}
            rangkaian ditemukan
          </p>
        </div>

        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/5 px-4"
            onClick={() =>
              onChange({ search: "", category: "all", price: "all" })
            }
          >
            <X className="mr-1.5 h-3.5 w-3.5" />
            Reset Filter
          </Button>
        )}
      </div>
    </div>
  );
}
