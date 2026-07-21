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
      className="border-y border-border/40 bg-white/70"
    >
      <div className="container py-10 md:py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {trustItems.map((item) => {
            const Icon = iconMap[item.icon];
            return (
              <div key={item.title} className="flex gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blush-50 text-primary ring-1 ring-primary/10">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-semibold tracking-tight">
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
