import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onReset?: () => void;
  title?: string;
  description?: string;
  primaryHref?: string;
  primaryLabel?: string;
}

export function EmptyState({
  onReset,
  title = "Belum ada produk yang cocok",
  description = "Coba ubah kata kunci, kategori, atau rentang harga. Atau request bouquet custom sesuai keinginanmu.",
  primaryHref = "/custom-order",
  primaryLabel = "Request custom",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-secondary/20 px-6 py-14 text-center md:py-16">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-primary shadow-sm ring-1 ring-border/50">
        <SearchX className="h-6 w-6" />
      </span>
      <h3 className="mt-5 font-serif text-xl font-semibold tracking-tight">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {onReset ? (
          <Button onClick={onReset} variant="outline" className="tracking-wide">
            Reset filter
          </Button>
        ) : null}
        <Button asChild className="tracking-wide">
          <Link href={primaryHref}>{primaryLabel}</Link>
        </Button>
      </div>
    </div>
  );
}
