import type { Metadata } from "next";
import { Sparkles, Clock, Heart } from "lucide-react";
import { CustomOrderForm } from "@/components/custom-order/custom-order-form";

export const metadata: Metadata = {
  title: "Custom Order Bouquet",
  description:
    "Request bouquet custom sesuai kebutuhanmu — pilih jenis, budget, dan tanggal. Submit langsung terhubung ke WhatsApp Mushida.",
};

const perks = [
  {
    icon: Sparkles,
    title: "Desain personal",
    desc: "Disesuaikan dengan tema, warna, dan preferensimu.",
  },
  {
    icon: Clock,
    title: "Respon cepat",
    desc: "Tim kami merespon kurang dari 30 menit di jam kerja.",
  },
  {
    icon: Heart,
    title: "Bunga premium",
    desc: "Bunga segar pilihan dari petani lokal terbaik.",
  },
];

export default function CustomOrderPage() {
  return (
    <div className="container py-10 md:py-14">
      <div className="grid gap-10 md:grid-cols-2 md:gap-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Custom Order
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight md:text-4xl">
            Rangkaian impianmu, kami yang racik 🌸
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            Tidak menemukan yang cocok di katalog? Isi form di samping dan
            kami akan rancang bouquet sesuai keinginanmu. Submit otomatis
            terhubung ke WhatsApp.
          </p>

          <div className="mt-8 space-y-4">
            {perks.map((p) => (
              <div
                key={p.title}
                className="flex gap-4 rounded-2xl border border-border/60 bg-white p-4 shadow-sm"
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
        </div>

        <CustomOrderForm />
      </div>
    </div>
  );
}
