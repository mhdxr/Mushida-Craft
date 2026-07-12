"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { categoryMap } from "@/data/categories";
import { formatCurrency } from "@/lib/utils";
import type { Product, ProductBadge } from "@/types";

const badgeMap: Record<
  ProductBadge,
  { label: string; variant: "default" | "accent" | "muted" }
> = {
  "best-seller": { label: "Best Seller", variant: "default" },
  new: { label: "New", variant: "accent" },
  "sold-out": { label: "Sold Out", variant: "muted" },
};

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const cat = categoryMap[product.category];
  const isSoldOut = product.badge === "sold-out" || !product.isAvailable;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link
        href={`/produk/${product.slug}`}
        className="group block overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {product.badge && (
            <div className="absolute left-3 top-3">
              <Badge variant={badgeMap[product.badge].variant}>
                {badgeMap[product.badge].label}
              </Badge>
            </div>
          )}
          {isSoldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="rounded-full bg-white/90 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-foreground">
                Sold Out
              </span>
            </div>
          )}
        </div>
        <div className="space-y-2 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-primary">
            {cat?.name}
          </p>
          <h3 className="font-serif text-lg font-semibold leading-tight tracking-tight">
            {product.name}
          </h3>
          <p className="text-sm font-semibold text-foreground">
            {formatCurrency(product.price)}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
