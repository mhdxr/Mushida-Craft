import type { Metadata } from "next";
import { Clock, Heart, Sparkles } from "lucide-react";
import { CustomOrderForm } from "@/components/custom-order/custom-order-form";
import { DeliveryNote } from "@/components/common/delivery-note";
import { faqItems } from "@/data/faq";
import { getDeliveryInfo } from "@/lib/delivery";
import { canonicalAlternates } from "@/lib/site";

export const metadata: Metadata = {
  title: "Custom Order Bouquet",
  description:
    "Request bouquet custom sesuai kebutuhanmu — pilih jenis, budget, dan tanggal. Submit langsung terhubung ke WhatsApp Mushida Craft.",
  alternates: canonicalAlternates("/custom-order"),
};

export default function CustomOrderPage() {
  const delivery = getDeliveryInfo();

  const perks = [
    {
      icon: Sparkles,
      title: "Desain personal",
      desc: "Disesuaikan dengan tema, warna, budget, dan momenmu.",
    },
    {
      icon: Clock,
      title: "Respon di jam operasional",
      desc: delivery.hours,
    },
    {
      icon: Heart,
      title: "Handmade premium",
      desc: "Dirangkai manual dengan material pilihan — artifisial, satin, snack, atau money.",
    },
  ];

  return (
    <div className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,rgba(255,196,213,0.3),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(252,232,200,0.35),transparent_50%)] py-10 md:py-16">
      <div className="container relative z-10">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16">
          {/* Di mobile: form dulu (order path), perks belakangan */}
          <div className="order-2 space-y-8 md:order-1">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
                Custom Order
              </p>
              <h1 className="mt-2 font-serif text-[2.5rem] font-medium leading-[1.15] md:text-[3rem]">
                Rangkaian impianmu, kami yang racik.
              </h1>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                Tidak menemukan yang cocok di katalog? Ceritakan ide kamu —
                kami bantu wujudkan bouquet impian Anda langsung terhubung ke WhatsApp.
              </p>
            </div>

            {/* List perk yang lebih teratur menyatu dengan garis halus vertikal */}
            <div className="relative border-l border-blush-200/50 pl-6 space-y-8">
              {perks.map((p) => (
                <div key={p.title} className="relative group">
                  {/* Titik penanda alur */}
                  <span className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white ring-2 ring-primary/30 group-hover:ring-primary transition-all duration-300" />
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-foreground/80">
                      {p.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <DeliveryNote showWhatsAppCta />
            </div>

            {/* FAQ ringkas — 4 pertanyaan paling sering di custom order */}
            <div className="space-y-4 pt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                FAQ singkat
              </p>
              <div className="space-y-3">
                {faqItems.slice(0, 4).map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-xl border border-blush-100/50 bg-white/50 px-4 py-1 open:shadow-sm"
                  >
                    <summary className="cursor-pointer list-none py-3 font-serif text-sm font-semibold tracking-tight text-foreground/80 marker:content-none [&::-webkit-details-marker]:hidden">
                      <span className="flex items-center justify-between gap-3">
                        <span>{item.question}</span>
                        <span
                          aria-hidden
                          className="text-primary transition-transform group-open:rotate-45"
                        >
                          +
                        </span>
                      </span>
                    </summary>
                    <p className="border-t border-blush-100/30 pb-3 pt-2 text-xs leading-relaxed text-muted-foreground">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <CustomOrderForm />
          </div>
        </div>
      </div>
    </div>
  );
}
