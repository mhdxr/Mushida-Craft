import { Hero } from "@/components/home/hero";
import { CategorySection } from "@/components/home/category-section";
import { FeaturedProducts } from "@/components/home/featured-products";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { HowToOrder } from "@/components/home/how-to-order";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedProducts />
      <CategorySection />
      <TestimonialsSection />
      <HowToOrder />
    </>
  );
}
