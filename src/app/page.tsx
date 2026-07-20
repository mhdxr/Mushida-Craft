import { Suspense } from "react";
import { Hero } from "@/components/home/hero";
import { CategorySection } from "@/components/home/category-section";
import { FeaturedProducts } from "@/components/home/featured-products";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { HowToOrder } from "@/components/home/how-to-order";

/**
 * Dynamic: produk unggulan harus mengikuti database (admin CRUD),
 * bukan cache seed/ISR lama.
 */
export const dynamic = "force-dynamic";

function FeaturedProductsFallback() {
  return (
    <section className="container py-16 md:py-24" aria-busy="true">
      <div className="h-8 w-48 animate-pulse rounded bg-secondary" />
      <div className="mt-4 h-4 w-72 animate-pulse rounded bg-secondary" />
      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm"
          >
            <div className="aspect-[4/5] animate-pulse bg-secondary" />
            <div className="space-y-2 p-4">
              <div className="h-2.5 w-16 animate-pulse rounded bg-secondary" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-secondary" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-secondary" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />
      {/* Suspense: hero tetap tampil dulu; produk unggulan stream belakangan. */}
      <Suspense fallback={<FeaturedProductsFallback />}>
        <FeaturedProducts />
      </Suspense>
      <CategorySection />
      <TestimonialsSection />
      <HowToOrder />
    </>
  );
}
