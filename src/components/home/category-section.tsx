import Link from "next/link";
import {
  Cookie,
  DollarSign,
  Flower2,
  GraduationCap,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { SectionHeading } from "@/components/common/section-heading";
import { categories } from "@/data/categories";
import type { ProductCategory } from "@/types";

const categoryIcons: Record<ProductCategory, LucideIcon> = {
  "snack-bouquet": Cookie,
  "money-bouquet": DollarSign,
  "artificial-bouquet": Flower2,
  graduation: GraduationCap,
  "satin-flower": Sparkles,
};

export function CategorySection() {
  return (
    <section className="section-soft py-16 md:py-24">
      <div className="container">
        <SectionHeading
          eyebrow="Kategori"
          title="Temukan buket sesuai momen"
          description="Spesialisasi kami: buket snack, money, artifisial, graduation, dan bunga satin."
        />
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-5">
          {categories.map((cat) => {
            const Icon = categoryIcons[cat.id];
            return (
              <Link
                key={cat.id}
                href={`/katalog?category=${cat.id}`}
                className="group flex h-full flex-col items-center gap-3 rounded-2xl border border-border/60 bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-blush-50 text-primary transition-colors group-hover:bg-primary/10">
                  <Icon className="h-7 w-7" />
                </span>
                <h3 className="font-serif text-base font-semibold tracking-tight">
                  {cat.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {cat.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
