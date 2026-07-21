"use client";

import Image from "next/image";
import { Edit2, PackagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { categoryMap } from "@/data/categories";
import { formatCurrency, truncate } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductTableProps {
  products: Product[];
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
  onCreate?: () => void;
}

export function ProductTable({
  products,
  onEdit,
  onDelete,
  onCreate,
}: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-secondary/20 px-6 py-14 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-primary shadow-sm ring-1 ring-border/50">
          <PackagePlus className="h-6 w-6" />
        </span>
        <h3 className="mt-5 font-serif text-xl font-semibold tracking-tight">
          Belum ada produk
        </h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Tambahkan produk pertama agar katalog & homepage bisa menampilkan
          koleksi.
        </p>
        {onCreate ? (
          <Button onClick={onCreate} className="mt-6 tracking-wide">
            Tambah produk
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/50 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border/50 bg-secondary/30 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Produk</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Harga</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const soldOut = p.badge === "sold-out" || !p.isAvailable;
              return (
                <tr
                  key={p.id}
                  className="border-b border-border/40 last:border-b-0"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-secondary">
                        {p.images[0] ? (
                          <Image
                            src={p.images[0]}
                            alt={p.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                            No img
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium tracking-tight">{p.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {truncate(p.description, 50)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {categoryMap[p.category]?.name}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {formatCurrency(p.price)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1">
                      {soldOut ? (
                        <Badge variant="muted">Sold Out</Badge>
                      ) : (
                        <Badge variant="success">Aktif</Badge>
                      )}
                      {p.badge === "best-seller" && (
                        <Badge>Best Seller</Badge>
                      )}
                      {p.badge === "new" && (
                        <Badge variant="accent">New</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(p)}
                        aria-label={`Edit ${p.name}`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(p)}
                        aria-label={`Hapus ${p.name}`}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
