import Image from "next/image";
import Link from "next/link";
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

const PLACEHOLDER = "/placeholder.jpg";

function productImageSrc(images: string[] | undefined): string {
  const first = images?.find((src) => typeof src === "string" && src.trim());
  return first?.trim() || PLACEHOLDER;
}

/** Kartu produk tanpa animasi client — gambar & link selalu aktif. */
export function ProductCard({ product }: ProductCardProps) {
  const cat = categoryMap[product.category];
  const isSoldOut = product.badge === "sold-out" || !product.isAvailable;
  const badge = product.badge ? badgeMap[product.badge] : undefined;
  const imageSrc = productImageSrc(product.images);

  return (
    <Link
      href={`/produk/${product.slug}`}
      className="group block overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
        <Image
          src={imageSrc}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {badge && (
          <div className="absolute left-3 top-3">
            <Badge variant={badge.variant}>{badge.label}</Badge>
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
  );
}
