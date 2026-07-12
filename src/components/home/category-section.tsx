"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/common/section-heading";
import { categories } from "@/data/categories";

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
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
            >
              <Link
                href={`/katalog?category=${cat.id}`}
                className="group flex h-full flex-col items-center gap-3 rounded-2xl border border-border/60 bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-blush-50 text-3xl">
                  {cat.icon}
                </span>
                <h3 className="font-serif text-base font-semibold tracking-tight">
                  {cat.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {cat.description}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
