import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onReset?: () => void;
}

export function EmptyState({ onReset }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-secondary/30 p-12 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-primary">
        <SearchX className="h-7 w-7" />
      </span>
      <h3 className="mt-4 font-serif text-xl font-semibold">
        Belum ada produk yang cocok
      </h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Coba ubah kata kunci, kategori, atau rentang harga. Atau kamu bisa
        request bouquet custom sesuai keinginanmu.
      </p>
      {onReset && (
        <Button onClick={onReset} variant="outline" className="mt-6">
          Reset filter
        </Button>
      )}
    </div>
  );
}
