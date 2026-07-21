import type { Metadata } from "next";
import { Suspense } from "react";
import { Hero } from "@/components/home/hero";
import { TrustStrip } from "@/components/home/trust-strip";
import { CategorySection } from "@/components/home/category-section";
import { FeaturedProducts } from "@/components/home/featured-products";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { HowToOrder } from "@/components/home/how-to-order";
import { FaqSection } from "@/components/home/faq-section";
import { canonicalAlternates } from "@/lib/site";

/** ISR 5 menit — homepage tidak memicu loading overlay dinamis terus-menerus. */
export const revalidate = 300;

export const metadata: Metadata = {
  alternates: canonicalAlternates("/"),
};

function HeroFallback() {
  return (
    <section className="hero-gradient relative overflow-hidden" aria-busy="true">
      <div className="container relative grid items-center gap-10 py-14 md:grid-cols-2 md:gap-12 md:py-24 lg:py-28">
        <div className="space-y-6">
          <div className="h-8 w-56 animate-pulse rounded-full bg-white/70" />
          <div className="space-y-3">
            <div className="h-10 w-full max-w-md animate-pulse rounded bg-white/80" />
            <div className="h-10 w-4/5 max-w-sm animate-pulse rounded bg-white/80" />
          </div>
          <div className="h-4 w-full max-w-lg animate-pulse rounded bg-white/60" />
          <div className="flex gap-3 pt-1">
            <div className="h-11 w-36 animate-pulse rounded-full bg-white/80" />
            <div className="h-11 w-36 animate-pulse rounded-full bg-white/60" />
          </div>
          <div className="flex gap-6 pt-2">
            <div className="h-12 w-20 animate-pulse rounded bg-white/60" />
            <div className="h-12 w-20 animate-pulse rounded bg-white/60" />
            <div className="h-12 w-20 animate-pulse rounded bg-white/60" />
          </div>
        </div>
        <div className="relative aspect-[4/5] animate-pulse rounded-3xl bg-white/50 shadow-xl" />
      </div>
    </section>
  );
}

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

/**
 * Tata letak homepage:
 * Hero → Trust → Unggulan → Kategori → Testimoni → Cara order → FAQ
 */
export default function HomePage() {
  return (
    <>
      <Suspense fallback={<HeroFallback />}>
        <Hero />
      </Suspense>
      <TrustStrip />
      <Suspense fallback={<FeaturedProductsFallback />}>
        <FeaturedProducts />
      </Suspense>
      <CategorySection />
      <TestimonialsSection />
      <HowToOrder />
      <FaqSection />
    </>
  );
}
