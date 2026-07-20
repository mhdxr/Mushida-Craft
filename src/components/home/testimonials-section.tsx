import Image from "next/image";
import { Star } from "lucide-react";
import { SectionHeading } from "@/components/common/section-heading";
import { testimonials } from "@/data/testimonials";

export function TestimonialsSection() {
  return (
    <section id="testimoni" className="container py-16 md:py-24">
      <SectionHeading
        eyebrow="Testimoni"
        title="Cerita dari para pelanggan kami"
        description="Lebih dari sekadar bouquet — kami merangkai kebahagiaan."
      />
      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {testimonials.map((t) => (
          <div
            key={t.id}
            className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm"
          >
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
              <div className="relative h-10 w-10 overflow-hidden rounded-full bg-secondary">
                <Image
                  src={t.avatar}
                  alt={t.name}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
