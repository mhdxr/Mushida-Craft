import { SectionHeading } from "@/components/common/section-heading";
import { faqItems } from "@/data/faq";
import { absoluteUrl, safeJsonLd } from "@/lib/site";

/** FAQ accordion native (details/summary) + JSON-LD FAQPage. */
export function FaqSection() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
    url: absoluteUrl("/#faq"),
  };

  return (
    <section id="faq" className="container py-16 md:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }}
      />

      <SectionHeading
        eyebrow="FAQ"
        title="Pertanyaan yang sering muncul"
        description="Jawaban singkat sebelum chat — biar order lebih cepat dan jelas."
      />

      <div className="mx-auto mt-12 max-w-2xl space-y-3">
        {faqItems.map((item) => (
          <details
            key={item.question}
            className="group rounded-2xl border border-blush-100/40 bg-white/60 px-5 py-1 backdrop-blur-sm transition-shadow open:bg-white/80 open:shadow-[0_8px_32px_-12px_rgba(255,196,213,0.2)]"
          >
            <summary className="cursor-pointer list-none py-4 font-serif text-base font-semibold tracking-tight text-foreground/85 marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-start justify-between gap-4">
                <span>{item.question}</span>
                <span
                  aria-hidden
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blush-50 to-cream-100 text-sm text-primary ring-1 ring-blush-100/50 transition-transform duration-200 group-open:rotate-45"
                >
                  +
                </span>
              </span>
            </summary>
            <p className="border-t border-blush-100/40 pb-4 pt-3 text-sm leading-relaxed text-muted-foreground">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
