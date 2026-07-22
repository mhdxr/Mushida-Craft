"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Inbox,
  MessageSquareQuote,
  Package,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/use-products";
import { useTestimonials } from "@/hooks/use-testimonials";
import { getTimeGreeting } from "@/lib/greeting";
import { cn } from "@/lib/utils";

export function AdminOverview() {
  const { products, isLoading: productsLoading } = useProducts();
  const { testimonials, isLoading: testimonialsLoading } = useTestimonials();
  const [newInquiries, setNewInquiries] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/admin/inquiries?count=new", {
          cache: "no-store",
        });
        const json = await res.json();
        if (!active) return;
        if (json?.ok && typeof json.count === "number") {
          setNewInquiries(json.count);
        } else {
          setNewInquiries(0);
        }
      } catch {
        if (active) setNewInquiries(0);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const soldOut = products.filter(
    (p) => !p.isAvailable || p.badge === "sold-out",
  ).length;
  const pending = testimonials.filter((t) => t.status === "pending").length;
  const greeting = getTimeGreeting();
  const inquiryCount = newInquiries ?? 0;

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
      label: "Inquiry baru",
      value: newInquiries === null ? "…" : String(inquiryCount),
      hint: inquiryCount > 0 ? "Perlu di-follow-up" : "Tidak ada antrean",
      href: "/admin/inquiries",
      icon: Inbox,
      tone: inquiryCount > 0 ? ("warn" as const) : ("default" as const),
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
            Kelola katalog, lead WhatsApp, dan moderasi testimoni.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link href="/admin/produk">
              <Plus className="h-4 w-4" />
              Tambah produk
            </Link>
          </Button>
          {inquiryCount > 0 ? (
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/inquiries">
                Lihat inquiry
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          ) : pending > 0 ? (
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/testimoni">
                Review testimoni
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl",
                    card.tone === "warn"
                      ? "bg-accent/15 text-accent-foreground"
                      : card.tone === "muted"
                        ? "bg-secondary text-muted-foreground"
                        : "bg-blush-50 text-primary",
                  )}
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
              href="/admin/inquiries"
              className="text-foreground underline-offset-4 hover:underline"
            >
              Inquiry WhatsApp
            </Link>
            {" — "}
            triage lead baru / sudah dihubungi
          </li>
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
