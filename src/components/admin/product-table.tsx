"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Edit2,
  ExternalLink,
  Loader2,
  PackagePlus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { categoryMap } from "@/data/categories";
import { formatCurrency, truncate, cn } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductTableProps {
  products: Product[];
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
  onCreate?: () => void;
  onToggleAvailable?: (p: Product, next: boolean) => Promise<void>;
}

function StatusBadges({ p }: { p: Product }) {
  const soldOut = p.badge === "sold-out" || !p.isAvailable;
  return (
    <div className="flex flex-wrap items-center gap-1">
      {soldOut ? (
        <Badge variant="muted">Sold Out</Badge>
      ) : (
        <Badge variant="success">Aktif</Badge>
      )}
      {p.badge === "best-seller" && <Badge>Best Seller</Badge>}
      {p.badge === "new" && <Badge variant="accent">New</Badge>}
    </div>
  );
}

function StockSwitch({
  p,
  busy,
  onToggle,
}: {
  p: Product;
  busy: boolean;
  onToggle?: (p: Product) => void;
}) {
  if (!onToggle) {
    return (
      <span className="text-xs text-muted-foreground">
        {p.isAvailable ? "On" : "Off"}
      </span>
    );
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={p.isAvailable}
      aria-label={
        p.isAvailable ? `Nonaktifkan ${p.name}` : `Aktifkan ${p.name}`
      }
      disabled={busy}
      onClick={() => onToggle(p)}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50",
        p.isAvailable
          ? "border-primary/30 bg-primary"
          : "border-border bg-secondary",
      )}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 rounded-full bg-white shadow transition-transform",
          p.isAvailable ? "translate-x-6" : "translate-x-1",
        )}
      />
      {busy ? (
        <Loader2 className="absolute inset-0 m-auto h-3.5 w-3.5 animate-spin text-primary-foreground" />
      ) : null}
    </button>
  );
}

function ActionButtons({
  p,
  onEdit,
  onDelete,
}: {
  p: Product;
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button variant="ghost" size="icon" asChild>
        <Link
          href={`/produk/${p.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Lihat ${p.name} di toko`}
        >
          <ExternalLink className="h-4 w-4" />
        </Link>
      </Button>
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
  );
}

export function ProductTable({
  products,
  onEdit,
  onDelete,
  onCreate,
  onToggleAvailable,
}: ProductTableProps) {
  const [busyId, setBusyId] = useState<string | null>(null);

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

  const handleToggle = async (p: Product) => {
    if (!onToggleAvailable) return;
    const next = !p.isAvailable;
    setBusyId(p.id);
    try {
      await onToggleAvailable(p, next);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      {/* Mobile: kartu */}
      <div className="space-y-3 md:hidden">
        {products.map((p) => {
          const busy = busyId === p.id;
          return (
            <article
              key={p.id}
              className="rounded-2xl border border-border/50 bg-white p-4 shadow-sm"
            >
              <div className="flex gap-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-secondary">
                  {p.images[0] ? (
                    <Image
                      src={p.images[0]}
                      alt={p.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                      No img
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium tracking-tight">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {categoryMap[p.category]?.name} · {formatCurrency(p.price)}
                  </p>
                  <div className="mt-2">
                    <StatusBadges p={p} />
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 border-t border-border/40 pt-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Stok</span>
                  <StockSwitch
                    p={p}
                    busy={busy}
                    onToggle={
                      onToggleAvailable ? (prod) => void handleToggle(prod) : undefined
                    }
                  />
                </div>
                <ActionButtons p={p} onEdit={onEdit} onDelete={onDelete} />
              </div>
            </article>
          );
        })}
      </div>

      {/* Desktop: tabel */}
      <div className="hidden overflow-hidden rounded-2xl border border-border/50 bg-white shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border/50 bg-secondary/30 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Produk</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Harga</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Stok</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const busy = busyId === p.id;
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
                      <StatusBadges p={p} />
                    </td>
                    <td className="px-4 py-3">
                      <StockSwitch
                        p={p}
                        busy={busy}
                        onToggle={
                          onToggleAvailable
                            ? (prod) => void handleToggle(prod)
                            : undefined
                        }
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ActionButtons p={p} onEdit={onEdit} onDelete={onDelete} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
