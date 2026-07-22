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
import { fetchCategories } from "@/lib/category-api";
import type { ProductCategory } from "@/types";

const categoryIcons: Record<ProductCategory, LucideIcon> = {
  "snack-bouquet": Cookie,
  "money-bouquet": DollarSign,
  "artificial-bouquet": Flower2,
  "graduation-bouquet": GraduationCap,
  "satin-flower": Sparkles,
};

export async function CategorySection() {
  const categories = await fetchCategories();

  return (
    <section id="kategori" className="section-soft py-16 md:py-24">
      <div className="container">
        <SectionHeading
          eyebrow="Kategori"
          title="Rangkaian untuk setiap momen"
          description="Snack, money, artifisial, graduation, dan satin — pilih yang paling dekat dengan ceritamu."
        />
        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-5">
          {categories.map((cat) => {
            const Icon = categoryIcons[cat.id] ?? Sparkles;
            return (
              <Link
                key={cat.id}
                href={`/katalog?category=${cat.id}`}
                className="group flex h-full flex-col items-center gap-3.5 rounded-2xl border border-border/50 bg-white/90 px-4 py-7 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md hover:shadow-primary/10"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blush-50 to-cream-100 text-primary ring-1 ring-primary/10 transition-transform duration-300 group-hover:scale-105">
                  <Icon className="h-6 w-6" />
                </span>
                <div className="space-y-1.5">
                  <h3 className="font-serif text-[15px] font-semibold tracking-tight">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    {cat.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
