import { SectionHeading } from "@/components/common/section-heading";
import { TestimonialFormToggle } from "@/components/home/testimonial-form-toggle";
import { TestimonialsLive } from "@/components/home/testimonials-live";
import { testimonials as seedTestimonials } from "@/data/testimonials";
import { fetchApprovedTestimonials } from "@/lib/testimonial-api";
import type { Testimonial } from "@/types";

export async function TestimonialsSection() {
  let items: Testimonial[] = [];
  let dbOk = false;

  try {
    items = await fetchApprovedTestimonials(60);
    dbOk = true;
  } catch {
    // Supabase belum siap / error — seed untuk first paint.
    items = seedTestimonials;
    dbOk = false;
  }

  // Seed hanya jika DB gagal. DB kosong + OK → biarkan live client tampilkan empty.
  const initialItems =
    dbOk && items.length === 0
      ? []
      : items.length > 0
        ? items
        : seedTestimonials;

  return (
    <section id="testimoni" className="relative overflow-hidden py-16 md:py-24">
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

      {/* Client: poll DB agar approve admin langsung kelihatan tanpa tunggu ISR. */}
      <TestimonialsLive initialItems={initialItems} />

      <div className="container mt-12">
        <TestimonialFormToggle />
      </div>
    </section>
  );
}
