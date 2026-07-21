"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  MessageSquareQuote,
  Package,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/use-products";
import { useTestimonials } from "@/hooks/use-testimonials";
import { getTimeGreeting } from "@/lib/greeting";

export function AdminOverview() {
  const { products, isLoading: productsLoading } = useProducts();
  const { testimonials, isLoading: testimonialsLoading } = useTestimonials();

  const soldOut = products.filter(
    (p) => !p.isAvailable || p.badge === "sold-out",
  ).length;
  const pending = testimonials.filter((t) => t.status === "pending").length;
  const greeting = getTimeGreeting();

  const cards = [
    {
      label: "Total produk",
      value: productsLoading ? "…" : String(products.length),
      hint: "Di katalog",
      href: "/admin/produk",
      icon: Package,
      tone: "default" as const,
    },
    {
      label: "Testimoni menunggu",
      value: testimonialsLoading ? "…" : String(pending),
      hint: pending > 0 ? "Perlu ditinjau" : "Semua bersih",
      href: "/admin/testimoni",
      icon: MessageSquareQuote,
      tone: pending > 0 ? ("warn" as const) : ("default" as const),
    },
    {
      label: "Sold out / nonaktif",
      value: productsLoading ? "…" : String(soldOut),
      hint: "Perlu dicek stok",
      href: "/admin/produk",
      icon: AlertTriangle,
      tone: soldOut > 0 ? ("muted" as const) : ("default" as const),
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
            Ringkasan
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
            {greeting}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola katalog & moderasi testimoni — order tetap via WhatsApp.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link href="/admin/produk">
              <Plus className="h-4 w-4" />
              Tambah produk
            </Link>
          </Button>
          {pending > 0 ? (
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/testimoni">
                Review testimoni
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="group rounded-2xl border border-border/50 bg-white p-5 shadow-sm transition-all hover:border-primary/25 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={
                    card.tone === "warn"
                      ? "flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent-foreground"
                      : "flex h-10 w-10 items-center justify-center rounded-xl bg-blush-50 text-primary"
                  }
                >
                  <Icon className="h-4 w-4" />
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <p className="mt-4 text-3xl font-semibold tracking-tight">
                {card.value}
              </p>
              <p className="mt-1 text-sm font-medium">{card.label}</p>
              <p className="text-xs text-muted-foreground">{card.hint}</p>
            </Link>
          );
        })}
      </div>

      <div className="rounded-2xl border border-border/50 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold tracking-tight">Aksi cepat</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>
            <Link
              href="/admin/produk"
              className="text-foreground underline-offset-4 hover:underline"
            >
              Kelola produk
            </Link>
            {" — "}
            tambah, edit, badge, stok
          </li>
          <li>
            <Link
              href="/admin/testimoni"
              className="text-foreground underline-offset-4 hover:underline"
            >
              Moderasi testimoni
            </Link>
            {" — "}
            setujui sebelum tampil di homepage
          </li>
          <li>
            <Link
              href="/"
              className="text-foreground underline-offset-4 hover:underline"
            >
              Lihat toko
            </Link>
            {" — "}
            cek tampilan publik
          </li>
        </ul>
      </div>
    </div>
  );
}
