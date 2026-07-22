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
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari nama bouquet..."
          aria-label="Cari bouquet"
          value={value.search}
          onChange={(e) => onChange({ ...value, search: e.target.value })}
          className="h-11 rounded-full border-border/60 bg-secondary/30 pl-10 pr-4 shadow-none focus-visible:bg-white"
        />
      </div>

      {/* Chip kategori — tenang, tanpa emoji berisik */}
      <div
        className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                "inline-flex shrink-0 items-center rounded-full border px-3.5 py-2 text-[13px] font-medium tracking-wide transition-all",
                active
                  ? "border-primary/30 bg-blush-50 text-foreground shadow-sm"
                  : "border-border/60 bg-white text-muted-foreground hover:border-primary/25 hover:text-foreground",
              )}
            >
              {chip.name}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-4">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <Select
            value={value.price}
            onValueChange={(v) =>
              onChange({ ...value, price: v as PriceRange })
            }
          >
            <SelectTrigger
              className="h-9 w-auto min-w-[10rem] rounded-full border-border/60 bg-white px-3 text-xs md:min-w-[12.5rem] md:text-sm"
              aria-label="Filter harga"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue placeholder="Rentang harga" />
            </SelectTrigger>
            <SelectContent>
              {priceOptions.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <p className="text-sm text-muted-foreground">
            <strong className="font-medium text-foreground">{total}</strong>{" "}
            produk
          </p>
        </div>

        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full text-muted-foreground hover:text-foreground"
            onClick={() =>
              onChange({ search: "", category: "all", price: "all" })
            }
          >
            <X className="h-3.5 w-3.5" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
