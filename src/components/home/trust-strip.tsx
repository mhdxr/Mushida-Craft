import type { LucideIcon } from "lucide-react";
import { MessageCircle, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { trustItems, type TrustItem } from "@/data/faq";

const iconMap: Record<TrustItem["icon"], LucideIcon> = {
  message: MessageCircle,
  shield: ShieldCheck,
  truck: Truck,
  sparkles: Sparkles,
};

/** Strip trust 4 kolom — ringkas, premium, tanpa CTA berisik. */
export function TrustStrip() {
  return (
    <section
      aria-label="Keunggulan Mushida Craft"
      className="relative border-y border-blush-100/40 bg-white/50 backdrop-blur-sm"
    >
      {/* Gradien latar radial halus agar tidak polos */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,196,213,0.08),transparent_70%)]"
      />

      <div className="container relative py-10 md:py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {trustItems.map((item) => {
            const Icon = iconMap[item.icon];
            return (
              <div key={item.title} className="group flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blush-50 to-cream-100 text-primary ring-1 ring-blush-100/60 shadow-[0_4px_16px_-6px_rgba(255,196,213,0.4)] transition-transform duration-300 group-hover:scale-105">
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <div className="min-w-0 space-y-1">
                  <p className="font-serif text-[15px] font-semibold tracking-tight text-foreground/90">
                    {item.title}
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground md:text-[13px]">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
