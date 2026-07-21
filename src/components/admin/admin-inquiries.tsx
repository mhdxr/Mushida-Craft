"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Inbox, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { Inquiry, InquirySource } from "@/lib/inquiry-api";

const sourceLabel: Record<InquirySource, string> = {
  pdp_inline: "PDP · Order",
  pdp_sticky: "PDP · Sticky",
  custom_order: "Custom order",
  fab: "FAB WhatsApp",
  footer: "Footer",
  delivery_note: "Cek ongkir",
  other: "Lainnya",
};

export function AdminInquiries() {
  const [items, setItems] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/inquiries?limit=100", {
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
            Catatan klik order / custom form — bukan sistem order penuh.
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
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border/70 bg-white px-6 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <Inbox className="h-5 w-5" />
          </span>
          <p className="mt-4 text-sm font-medium">Belum ada inquiry</p>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            Saat pelanggan klik Order WhatsApp atau kirim custom order, entri
            muncul di sini. Pastikan migrasi{" "}
            <code className="rounded bg-secondary px-1">0005_inquiries</code>{" "}
            sudah dijalankan.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/50 bg-white shadow-sm">
          <ul className="divide-y divide-border/50">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
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
                    <p className="text-sm text-muted-foreground line-clamp-2">
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
                {item.productSlug ? (
                  <Button asChild variant="ghost" size="sm" className="shrink-0">
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
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
