import { SectionHeading } from "@/components/common/section-heading";
import { TestimonialFormToggle } from "@/components/home/testimonial-form-toggle";
import { TestimonialMarquee } from "@/components/home/testimonial-marquee";
import { testimonials as seedTestimonials } from "@/data/testimonials";
import { fetchApprovedTestimonials } from "@/lib/testimonial-api";
import type { Testimonial } from "@/types";

export async function TestimonialsSection() {
  let items: Testimonial[] = [];
  try {
    // Cap 60: cukup untuk 2-baris marquee, tetap ringan di homepage.
    items = await fetchApprovedTestimonials(60);
  } catch {
    items = [];
  }

  // Fallback ke seed statis bila belum ada testimoni approved di DB.
  if (items.length === 0) {
    items = seedTestimonials;
  }

  return (
    <section id="testimoni" className="relative overflow-hidden py-16 md:py-24">
      {/* background lembut biar section terasa premium */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(255,196,213,0.18),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(252,232,200,0.25),transparent_50%)]"
      />

      <div className="container">
        <SectionHeading
          eyebrow="Testimoni"
          title="Cerita dari para pelanggan kami"
          description="Lebih dari sekadar bouquet — kami merangkai kebahagiaan."
        />
      </div>

      <TestimonialMarquee items={items} />

      <div className="container mt-12">
        <TestimonialFormToggle />
      </div>
    </section>
  );
}
