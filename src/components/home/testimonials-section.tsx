import Image from "next/image";
import { Star } from "lucide-react";
import { SectionHeading } from "@/components/common/section-heading";
import { TestimonialFormToggle } from "@/components/home/testimonial-form-toggle";
import { testimonials as seedTestimonials } from "@/data/testimonials";
import { fetchApprovedTestimonials } from "@/lib/testimonial-api";
import type { Testimonial } from "@/types";

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
      <div
        className="flex items-center gap-1 text-amber-400"
        aria-label={`Rating ${t.rating} dari 5`}
      >
        {Array.from({ length: t.rating }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-current" />
        ))}
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        “{t.message}”
      </p>
      <div className="mt-6 flex items-center gap-3">
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-xs font-semibold text-primary">
          {t.avatar ? (
            <Image
              src={t.avatar}
              alt={t.name}
              fill
              sizes="40px"
              className="object-cover"
            />
          ) : (
            <span aria-hidden>{getInitials(t.name) || "?"}</span>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold">{t.name}</p>
          {t.role ? (
            <p className="text-xs text-muted-foreground">{t.role}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export async function TestimonialsSection() {
  let items: Testimonial[] = [];
  try {
    items = await fetchApprovedTestimonials(8);
  } catch {
    items = [];
  }

  // Fallback ke seed statis bila belum ada testimoni approved di DB.
  if (items.length === 0) {
    items = seedTestimonials;
  }

  return (
    <section id="testimoni" className="container py-16 md:py-24">
      <SectionHeading
        eyebrow="Testimoni"
        title="Cerita dari para pelanggan kami"
        description="Lebih dari sekadar bouquet — kami merangkai kebahagiaan."
      />
      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {items.map((t) => (
          <TestimonialCard key={t.id} t={t} />
        ))}
      </div>
      <div className="mt-10">
        <TestimonialFormToggle />
      </div>
    </section>
  );
}
