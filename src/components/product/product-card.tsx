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

/** Kartu produk premium — spasi lapang, tipografi tenang, hover halus. */
export function ProductCard({ product }: ProductCardProps) {
  const cat = categoryMap[product.category];
  const isSoldOut = product.badge === "sold-out" || !product.isAvailable;

  return (
    <Link
      href={`/produk/${product.slug}`}
      className="group block overflow-hidden rounded-2xl border border-border/50 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/10"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary/60">
        <Image
          src={product.images[0] ?? "/placeholder.png"}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        {product.badge && (
          <div className="absolute left-3 top-3">
            <Badge variant={badgeMap[product.badge].variant}>
              {badgeMap[product.badge].label}
            </Badge>
          </div>
        )}
        {isSoldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/35 backdrop-blur-[1px]">
            <span className="rounded-full bg-white/95 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground">
              Sold Out
            </span>
          </div>
        )}
      </div>
      <div className="space-y-1.5 px-4 py-4 md:px-5 md:py-5">
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-primary/90">
          {cat?.name}
        </p>
        <h3 className="font-serif text-lg font-medium leading-snug md:text-xl">
          {product.name}
        </h3>
        <p className="pt-0.5 text-sm font-medium text-foreground/90">
          {formatCurrency(product.price)}
        </p>
      </div>
    </Link>
  );
}
