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
      className="group block overflow-hidden rounded-2xl bg-white shadow-[0_4px_24px_-8px_rgba(255,196,213,0.12)] border border-blush-100/30 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_16px_40px_-16px_rgba(255,196,213,0.35)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary/30">
        <Image
          src={product.images[0] ?? "/placeholder.png"}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        {product.badge && (
          <div className="absolute left-3.5 top-3.5">
            <Badge variant={badgeMap[product.badge].variant}>
              {badgeMap[product.badge].label}
            </Badge>
          </div>
        )}
        {isSoldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/25 backdrop-blur-[1px]">
            <span className="rounded-full bg-white/95 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground shadow-sm">
              Sold Out
            </span>
          </div>
        )}
      </div>
      <div className="space-y-2 px-5 py-5 md:px-6 md:py-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/80">
          {cat?.name}
        </p>
        <h3 className="font-serif text-lg font-medium leading-snug md:text-[1.25rem] text-foreground/90 group-hover:text-primary transition-colors duration-300">
          {product.name}
        </h3>
        <p className="pt-0.5 text-sm font-semibold text-foreground/70">
          {formatCurrency(product.price)}
        </p>
      </div>
    </Link>
  );
}
