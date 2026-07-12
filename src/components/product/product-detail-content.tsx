"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProductGallery } from "@/components/product/product-gallery";
import { OrderButton } from "@/components/product/order-button";
import { ProductGrid } from "@/components/product/product-grid";
import { SectionHeading } from "@/components/common/section-heading";
import {
  localProductRepository,
  findRelatedProducts,
} from "@/lib/product-store";
import { getProductBySlug } from "@/data/products";
import { categoryMap } from "@/data/categories";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductDetailContentProps {
  slug: string;
}

export function ProductDetailContent({ slug }: ProductDetailContentProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [status, setStatus] = useState<"loading" | "found" | "not-found">(
    "loading",
  );

  useEffect(() => {
    let active = true;
    (async () => {
      // Coba repository (localStorage) dulu, fallback ke seed statis.
      let found = await localProductRepository.getBySlug(slug);
      if (!found) {
        found = getProductBySlug(slug);
      }
      if (!active) return;
      if (!found) {
        setStatus("not-found");
        return;
      }
      setProduct(found);
      const all = await localProductRepository.list();
      setRelated(findRelatedProducts(found, all, 4));
      setStatus("found");
    })();
    return () => {
      active = false;
    };
  }, [slug]);

  if (status === "loading") {
    return null; // loading.tsx yang menangani skeleton
  }

  if (status === "not-found" || !product) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-serif text-2xl font-semibold">
          Produk tidak ditemukan
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Produk mungkin telah dihapus atau URL tidak valid.
        </p>
        <Link
          href="/katalog"
          className="mt-6 inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke katalog
        </Link>
      </div>
    );
  }

  const cat = categoryMap[product.category];
  const isAvailable = product.isAvailable && product.badge !== "sold-out";

  return (
    <div className="container py-10 md:py-14">
      <Link
        href="/katalog"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke katalog
      </Link>

      <div className="mt-6 grid gap-10 md:grid-cols-2 md:gap-12">
        <ProductGallery images={product.images} alt={product.name} />

        <div className="flex flex-col">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {cat?.name}
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight md:text-4xl">
            {product.name}
          </h1>
          <p className="mt-4 font-serif text-3xl font-semibold text-foreground">
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

          <div className="mt-6 rounded-2xl border border-border/60 bg-secondary/40 p-4 text-sm text-muted-foreground">
            <p>
              💌 <strong className="text-foreground">Free greeting card</strong>{" "}
              + same-day delivery untuk wilayah dalam kota.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <OrderButton product={product} className="w-full sm:w-auto" />
            <Link
              href="/custom-order"
              className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-background px-8 text-sm font-medium hover:bg-secondary"
            >
              Custom Bouquet
            </Link>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <SectionHeading
            eyebrow="Produk Terkait"
            title="Mungkin kamu juga suka"
            description="Pilihan rangkaian serupa dari kategori yang sama."
          />
          <div className="mt-10">
            <ProductGrid products={related} />
          </div>
        </section>
      )}
    </div>
  );
}
