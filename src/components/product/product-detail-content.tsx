"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Flower2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DeliveryNote } from "@/components/common/delivery-note";
import { ProductGallery } from "@/components/product/product-gallery";
import { OrderButton } from "@/components/product/order-button";
import { StickyOrderBar } from "@/components/product/sticky-order-bar";
import { ProductDetailSkeleton } from "@/components/product/product-detail-skeleton";
import { ProductGrid } from "@/components/product/product-grid";
import { SectionHeading } from "@/components/common/section-heading";
import { categoryMap } from "@/data/categories";
import { AnalyticsEvent, track } from "@/lib/analytics";
import { formatCurrency } from "@/lib/utils";
import { findRelatedProducts } from "@/lib/product-store";
import type { Product } from "@/types";

interface ProductDetailContentProps {
  slug: string;
  /** Produk seed (dari static data) jika ada — dipakai sebagai fallback SSR. */
  initialProduct?: Product | null;
}

export function ProductDetailContent({
  slug,
  initialProduct,
}: ProductDetailContentProps) {
  const [product, setProduct] = useState<Product | null>(
    initialProduct ?? null,
  );
  const [related, setRelated] = useState<Product[]>([]);
  const [status, setStatus] = useState<"loading" | "found" | "not-found">(
    initialProduct ? "found" : "loading",
  );
  const trackedViewId = useRef<string | null>(null);

  // view_item sekali per product id (seed SSR atau hasil fetch).
  useEffect(() => {
    if (!product) return;
    if (trackedViewId.current === product.id) return;
    trackedViewId.current = product.id;
    track(AnalyticsEvent.VIEW_ITEM, {
      product_id: product.id,
      product_slug: product.slug,
      product_name: product.name,
      price: product.price,
      category: product.category,
    });
  }, [product]);

  useEffect(() => {
    if (initialProduct) {
      setProduct(initialProduct);
      setStatus("found");
    }

    let active = true;

    (async () => {
      try {
        // Ambil detail + list paralel, lalu hitung related dari produk final
        // (hindari race: related dihitung dari product state yang masih lama).
        const [detailRes, listRes] = await Promise.all([
          fetch(`/api/products?slug=${encodeURIComponent(slug)}`, {
            cache: "no-store",
          }),
          fetch("/api/products", { cache: "no-store" }),
        ]);

        if (!active) return;

        const detailJson = await detailRes.json().catch(() => null);
        const listJson = await listRes.json().catch(() => null);

        let resolved: Product | null = initialProduct ?? null;

        if (detailRes.ok && detailJson?.ok && detailJson.product) {
          resolved = detailJson.product as Product;
          setProduct(resolved);
          setStatus("found");
        } else if (!initialProduct) {
          setStatus("not-found");
          return;
        }

        if (
          resolved &&
          listRes.ok &&
          listJson?.ok &&
          Array.isArray(listJson.products)
        ) {
          setRelated(
            findRelatedProducts(resolved, listJson.products as Product[], 4),
          );
        }
      } catch {
        if (!initialProduct) setStatus("not-found");
      }
    })();

    return () => {
      active = false;
    };
  }, [slug, initialProduct]);

  if (status === "loading") {
    return <ProductDetailSkeleton />;
  }

  if (status === "not-found" || !product) {
    return (
      <div className="relative flex min-h-[60vh] items-center justify-center overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(circle at 50% 30%, rgba(255,196,213,0.35) 0%, transparent 60%)",
          }}
        />
        <div className="container relative flex flex-col items-center py-16 text-center">
          <Flower2 className="mb-4 h-12 w-12 text-primary/20" aria-hidden />
          <h1 className="font-serif text-2xl font-semibold tracking-tight md:text-3xl">
            Produk tidak ditemukan
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            Rangkaian ini mungkin sudah dihapus atau URL-nya tidak valid. Yuk
            lihat koleksi lain yang masih tersedia.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/katalog">Ke katalog</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Ke beranda
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const cat = categoryMap[product.category];
  const isAvailable = product.isAvailable && product.badge !== "sold-out";

  return (
    <div className="container py-10 md:py-14">
      <Link
        href="/katalog"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke katalog
      </Link>

      <div className="mt-6 grid gap-10 md:grid-cols-2 md:gap-12">
        <ProductGallery images={product.images} alt={product.name} />

        <div className="flex flex-col">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
            {cat?.name}
          </p>
          <h1 className="mt-2 font-serif text-[2rem] font-medium leading-[1.15] md:text-[2.75rem]">
            {product.name}
          </h1>
          <p className="mt-4 font-serif text-[1.85rem] font-medium text-foreground md:text-[2.15rem]">
            {formatCurrency(product.price)}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {product.badge === "best-seller" && <Badge>Best Seller</Badge>}
            {product.badge === "new" && <Badge variant="accent">New</Badge>}
            {isAvailable ? (
              <Badge variant="success">
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                Tersedia
              </Badge>
            ) : (
              <Badge variant="muted">
                <XCircle className="mr-1 h-3.5 w-3.5" />
                Sold Out
              </Badge>
            )}
          </div>

          <Separator className="my-6" />

          <div className="space-y-3">
            <h2 className="font-serif text-lg font-semibold">Deskripsi</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          </div>

          <div className="mt-6">
            <DeliveryNote showWhatsAppCta />
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <OrderButton product={product} className="w-full sm:w-auto" />
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full tracking-wide sm:w-auto"
            >
              <Link href="/custom-order">Custom Bouquet</Link>
            </Button>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <SectionHeading
            eyebrow="Produk terkait"
            title="Mungkin kamu juga suka"
            description="Pilihan rangkaian serupa dari kategori yang sama."
          />
          <div className="mt-10">
            <ProductGrid products={related} />
          </div>
        </section>
      )}

      {/* Spacer agar konten tidak ketutup sticky bar di mobile */}
      <div className="h-24 md:hidden" aria-hidden />
      <StickyOrderBar product={product} />
    </div>
  );
}
