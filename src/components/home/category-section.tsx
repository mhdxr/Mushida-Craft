"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Flower2,
  Heart,
  GraduationCap,
  Gift,
  DollarSign,
  Leaf,
  type LucideIcon,
} from "lucide-react";
import { SectionHeading } from "@/components/common/section-heading";
import { categories } from "@/data/categories";
import type { ProductCategory } from "@/types";

// Mapping kategori → lucide-react icon (sebelumnya pakai emoji).
const categoryIcons: Record<ProductCategory, LucideIcon> = {
  "hand-bouquet": Flower2,
  wedding: Heart,
  graduation: GraduationCap,
  anniversary: Gift,
  "money-bouquet": DollarSign,
  "dried-flower": Leaf,
};

export function CategorySection() {
  return (
    <section className="section-soft py-16 md:py-24">
      <div className="container">
        <SectionHeading
          eyebrow="Kategori"
          title="Temukan bouquet sesuai momen"
          description="Setiap kategori dirancang untuk merayakan momen spesial Anda."
        />
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-6">
          {categories.map((cat, idx) => {
            const Icon = categoryIcons[cat.id];
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.3) }}
              >
                <Link
                  href={`/katalog?category=${cat.id}`}
                  className="group flex h-full flex-col items-center gap-3 rounded-2xl border border-border/60 bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-blush-50 text-primary transition-colors group-hover:bg-primary/10">
                    {Icon ? <Icon className="h-7 w-7" /> : <Flower2 className="h-7 w-7" />}
                  </span>
                  <h3 className="font-serif text-base font-semibold tracking-tight">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {cat.description}
                  </p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
