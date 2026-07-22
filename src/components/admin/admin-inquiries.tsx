"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Archive,
  CheckCircle2,
  ExternalLink,
  Inbox,
  Loader2,
  MessageCircle,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { cn, formatCurrency } from "@/lib/utils";
import type { Inquiry, InquirySource, InquiryStatus } from "@/lib/inquiry-api";

const sourceLabel: Record<InquirySource, string> = {
  pdp_inline: "PDP · Order",
  pdp_sticky: "PDP · Sticky",
  custom_order: "Custom order",
  fab: "FAB WhatsApp",
  footer: "Footer",
  delivery_note: "Cek ongkir",
  other: "Lainnya",
};

const statusLabel: Record<InquiryStatus, string> = {
  new: "Baru",
  contacted: "Dihubungi",
  archived: "Arsip",
};

const filters: Array<{ id: InquiryStatus | "all"; label: string }> = [
  { id: "all", label: "Semua" },
  { id: "new", label: "Baru" },
  { id: "contacted", label: "Dihubungi" },
  { id: "archived", label: "Arsip" },
];

export function AdminInquiries() {
  const [items, setItems] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<InquiryStatus | "all">("new");
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Ambil semua, filter di client agar hitungan chip akurat.
      const res = await fetch("/api/admin/inquiries?limit=100&status=all", {
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.message || "Gagal memuat inquiry.");
      }
      setItems(json.inquiries as Inquiry[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat inquiry.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const counts = useMemo(() => {
    const base = { all: items.length, new: 0, contacted: 0, archived: 0 };
    for (const item of items) {
      base[item.status] += 1;
    }
    return base;
  }, [items]);

  const visible = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((i) => i.status === filter);
  }, [items, filter]);

  const setStatus = async (item: Inquiry, status: InquiryStatus) => {
    if (item.status === status) return;
    setBusyId(item.id);
    try {
      const res = await fetch(`/api/admin/inquiries/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.message || "Gagal mengubah status.");
      }
      setItems((prev) =>
        prev.map((row) =>
          row.id === item.id ? { ...row, status } : row,
        ),
      );
      toast.success(`Status → ${statusLabel[status]}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Gagal mengubah status.",
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
            Leads
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
            Inquiry WhatsApp
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Catatan klik order / custom form — tandai sudah dihubungi atau
            arsipkan.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void refresh()}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Muat ulang
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              filter === f.id
                ? "border-primary/40 bg-blush-50 text-foreground"
                : "border-border/60 bg-white text-muted-foreground hover:bg-secondary",
            )}
          >
            {f.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                filter === f.id
                  ? "bg-primary/15 text-primary"
                  : "bg-secondary text-muted-foreground",
              )}
            >
              {counts[f.id]}
            </span>
          </button>
        ))}
      </div>

      {error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {loading && items.length === 0 ? (
        <div className="space-y-3 rounded-2xl border border-border/50 bg-white p-4 shadow-sm">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-secondary" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border/70 bg-white px-6 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <Inbox className="h-5 w-5" />
          </span>
          <p className="mt-4 text-sm font-medium">
            {filter === "all"
              ? "Belum ada inquiry"
              : `Tidak ada inquiry “${statusLabel[filter as InquiryStatus]}”`}
          </p>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            Saat pelanggan klik Order WhatsApp atau kirim custom order, entri
            muncul di sini. Pastikan migrasi{" "}
            <code className="rounded bg-secondary px-1">0005</code> +{" "}
            <code className="rounded bg-secondary px-1">0007</code> sudah
            dijalankan.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/50 bg-white shadow-sm">
          <ul className="divide-y divide-border/50">
            {visible.map((item) => {
              const busy = busyId === item.id;
              return (
                <li
                  key={item.id}
                  className={cn(
                    "flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between",
                    item.status === "new" && "bg-accent/5",
                  )}
                >
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={
                          item.status === "new"
                            ? "accent"
                            : item.status === "contacted"
                              ? "success"
                              : "muted"
                        }
                      >
                        {statusLabel[item.status]}
                      </Badge>
                      <Badge variant="muted">
                        {sourceLabel[item.source] ?? item.source}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleString("id-ID")}
                      </span>
                    </div>
                    {item.productName ? (
                      <p className="font-medium tracking-tight">
                        {item.productName}
                        {typeof item.productPrice === "number" ? (
                          <span className="ml-2 text-sm font-normal text-muted-foreground">
                            {formatCurrency(item.productPrice)}
                          </span>
                        ) : null}
                      </p>
                    ) : (
                      <p className="font-medium tracking-tight">
                        {item.customerName || "Inquiry umum"}
                      </p>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {item.customerWa ? (
                        <span>WA: {item.customerWa}</span>
                      ) : null}
                      {item.customerName && item.productName ? (
                        <span className="ml-2">· {item.customerName}</span>
                      ) : null}
                    </div>
                    {item.notes ? (
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {item.notes}
                      </p>
                    ) : null}
                    {item.meta &&
                    typeof item.meta === "object" &&
                    ("occasion" in item.meta ||
                      "deliveryArea" in item.meta ||
                      "bouquetType" in item.meta) ? (
                      <p className="text-xs text-muted-foreground">
                        {[
                          item.meta.bouquetType
                            ? `Jenis: ${String(item.meta.bouquetType)}`
                            : null,
                          item.meta.occasion
                            ? `Momen: ${String(item.meta.occasion)}`
                            : null,
                          item.meta.deliveryArea
                            ? `Area: ${String(item.meta.deliveryArea)}`
                            : null,
                          item.meta.budget
                            ? `Budget: ${String(item.meta.budget)}`
                            : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    {item.productSlug ? (
                      <Button asChild variant="ghost" size="sm">
                        <a
                          href={`/produk/${item.productSlug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Produk
                        </a>
                      </Button>
                    ) : null}

                    {item.status !== "contacted" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy}
                        onClick={() => void setStatus(item, "contacted")}
                      >
                        {busy ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <MessageCircle className="h-3.5 w-3.5" />
                        )}
                        Dihubungi
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy}
                        onClick={() => void setStatus(item, "new")}
                      >
                        {busy ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <RotateCcw className="h-3.5 w-3.5" />
                        )}
                        Kembali baru
                      </Button>
                    )}

                    {item.status !== "archived" ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busy}
                        onClick={() => void setStatus(item, "archived")}
                      >
                        {busy ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Archive className="h-3.5 w-3.5" />
                        )}
                        Arsip
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busy}
                        onClick={() => void setStatus(item, "contacted")}
                      >
                        {busy ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        )}
                        Buka lagi
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
