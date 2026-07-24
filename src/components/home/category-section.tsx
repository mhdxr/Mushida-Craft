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
    <section id="kategori" className="relative py-20 md:py-32">
      {/* Latar editorial halus dengan gradien dan blur */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,196,213,0.15),transparent_50%)]"
      />

      <div className="container">
        <SectionHeading
          eyebrow="Kategori"
          title="Rangkaian untuk setiap momen"
          description="Snack, money, artifisial, graduation, dan satin — pilih yang paling dekat dengan ceritamu."
        />

        {/* Mengubah kotak (cards) menjadi gaya pill/elemen mengambang yang lebih modern */}
        <div className="mt-16 flex flex-wrap justify-center gap-4 sm:gap-6 lg:gap-8">
          {categories.map((cat) => {
            const Icon = categoryIcons[cat.id] ?? Sparkles;
            return (
              <Link
                key={cat.id}
                href={`/katalog?category=${cat.id}`}
                className="group relative flex flex-col items-center gap-4 transition-all duration-300 hover:-translate-y-2"
              >
                {/* Lingkaran ikon premium yang besar dan lapang */}
                <div className="relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full bg-white/60 shadow-[0_8px_32px_-8px_rgba(255,196,213,0.25)] ring-1 ring-blush-100/50 backdrop-blur-md transition-all duration-500 group-hover:bg-white/90 group-hover:shadow-[0_16px_48px_-12px_rgba(255,196,213,0.4)] group-hover:ring-primary/20">
                  <div className="absolute inset-2 rounded-full border border-dashed border-blush-200/50 transition-all duration-500 group-hover:rotate-12 group-hover:scale-105" />
                  <Icon className="relative z-10 h-8 w-8 text-primary/70 transition-colors duration-300 group-hover:text-primary" strokeWidth={1.5} />
                </div>

                {/* Teks tanpa wadah (borderless) */}
                <div className="text-center space-y-1 max-w-[8rem] sm:max-w-[10rem]">
                  <h3 className="font-serif text-[17px] font-semibold tracking-tight text-foreground/80 group-hover:text-primary transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
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
