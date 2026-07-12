"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories } from "@/data/categories";
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
  { value: "300-500", label: "Rp300.000 - Rp500.000" },
  { value: "500-700", label: "Rp500.000 - Rp700.000" },
  { value: "above-700", label: "Di atas Rp700.000" },
];

export function CatalogFilters({
  value,
  onChange,
  total,
}: CatalogFiltersProps) {
  const isFiltered =
    value.search.length > 0 ||
    value.category !== "all" ||
    value.price !== "all";

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari nama bouquet..."
            value={value.search}
            onChange={(e) =>
              onChange({ ...value, search: e.target.value })
            }
            className="pl-10"
          />
        </div>

        <Select
          value={value.category}
          onValueChange={(v) =>
            onChange({ ...value, category: v as CatalogFiltersValue["category"] })
          }
        >
          <SelectTrigger className="md:w-[200px]">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua kategori</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={value.price}
          onValueChange={(v) =>
            onChange({ ...value, price: v as PriceRange })
          }
        >
          <SelectTrigger className="md:w-[220px]">
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
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Menampilkan <strong className="text-foreground">{total}</strong>{" "}
          produk
        </p>
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              onChange({ search: "", category: "all", price: "all" })
            }
          >
            <X className="h-3.5 w-3.5" />
            Reset filter
          </Button>
        )}
      </div>
    </div>
  );
}
