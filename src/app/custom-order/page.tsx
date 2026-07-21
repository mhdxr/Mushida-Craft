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
    <div className="container py-10 md:py-14">
      <div className="grid gap-10 md:grid-cols-2 md:gap-12">
        {/* Di mobile: form dulu (order path), perks belakangan */}
        <div className="order-2 space-y-6 md:order-1">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Custom Order
            </p>
            <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight md:text-4xl">
              Rangkaian impianmu, kami yang racik
            </h1>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              Tidak menemukan yang cocok di katalog? Ceritakan ide kamu —
              submit form otomatis terhubung ke WhatsApp admin.
            </p>
          </div>

          <div className="space-y-3">
            {perks.map((p) => (
              <div
                key={p.title}
                className="flex gap-4 rounded-2xl border border-border/50 bg-white p-4 shadow-sm"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blush-50 text-primary">
                  <p.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-serif text-base font-semibold">
                    {p.title}
                  </p>
                  <p className="text-sm text-muted-foreground">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <DeliveryNote showWhatsAppCta />

          {/* FAQ ringkas — 4 pertanyaan paling sering di custom order */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              FAQ singkat
            </p>
            <div className="space-y-2">
              {faqItems.slice(0, 4).map((item) => (
                <details
                  key={item.question}
                  className="group rounded-xl border border-border/50 bg-white px-4 open:shadow-sm"
                >
                  <summary className="cursor-pointer list-none py-3 text-sm font-medium tracking-tight marker:content-none [&::-webkit-details-marker]:hidden">
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
                  <p className="border-t border-border/40 pb-3 pt-2 text-xs leading-relaxed text-muted-foreground">
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
  );
}
