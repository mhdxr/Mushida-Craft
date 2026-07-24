import Link from "next/link";
import { MessageCircle, Search, Sparkles, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/common/section-heading";
import { buildDeliverySummary } from "@/lib/delivery";

const steps = [
  {
    icon: Search,
    title: "Pilih rangkaian",
    description: "Jelajahi katalog atau ceritakan ide custom kamu.",
  },
  {
    icon: MessageCircle,
    title: "Konsultasi via WhatsApp",
    description: "Admin kami bantu konfirmasi detail, budget, dan tanggal.",
  },
  {
    icon: Sparkles,
    title: "Dirangkai khusus",
    description: "Setiap bouquet dibuat handmade dengan sentuhan personal.",
  },
  {
    icon: Truck,
    title: "Diantar tepat waktu",
    description: buildDeliverySummary(),
  },
];

export function HowToOrder() {
  return (
    <section id="cara-order" className="section-soft py-16 md:py-24 overflow-hidden">
      <div className="container">
        <SectionHeading
          eyebrow="Cara order"
          title="Sederhana, personal, tanpa ribet"
          description="Empat langkah elegan dari pilih rangkaian hingga sampai ke tangan tersayang."
        />

        {/* Alur horizontal dengan garis penghubung — bukan kotak-kotak berulang */}
        <div className="relative mt-16 mx-auto max-w-5xl">
          {/* Garis penghubung horizontal — hanya di desktop */}
          <div
            aria-hidden
            className="absolute top-8 left-[12%] right-[12%] hidden h-px bg-gradient-to-r from-transparent via-blush-200 to-transparent lg:block"
          />

          <div className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {steps.map((s, idx) => (
              <div
                key={s.title}
                className="relative flex flex-col items-center text-center group"
              >
                {/* Lingkaran ikon — titik utama pada alur */}
                <div className="relative z-10 mb-5">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white ring-1 ring-blush-100 shadow-[0_4px_16px_-4px_rgba(255,196,213,0.35)] text-primary transition-all duration-300 group-hover:ring-primary/40 group-hover:scale-105">
                    <s.icon className="h-6 w-6" />
                  </span>
                  {/* Nomor bertengger di atas lingkaran */}
                  <span
                    aria-hidden
                    className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary/90 font-serif text-[10px] font-semibold text-white shadow-sm"
                  >
                    {idx + 1}
                  </span>
                </div>

                <h3 className="font-serif text-lg font-semibold tracking-tight md:text-xl">
                  {s.title}
                </h3>
                <p className="mt-2 max-w-[15rem] text-sm leading-relaxed text-muted-foreground">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA bawah — bergaya editorial, senada dengan bagian lain */}
        <div className="mt-20 flex flex-col items-center gap-4 text-center border-t border-blush-100/60 pt-12 mx-auto max-w-2xl">
          <p className="font-serif text-2xl italic text-foreground/80 md:text-3xl">
            Siap merangkai momen spesial Anda?
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Mulai dari katalog siap kirim, atau ceritakan ide kamu untuk custom order.
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-primary/90 px-8 py-6 text-sm font-semibold tracking-wide hover:bg-primary shadow-sm transition-all hover:scale-105"
            >
              <Link href="/katalog">Lihat Katalog</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full border-blush-200/60 bg-white/70 px-8 py-6 text-sm font-semibold tracking-wide backdrop-blur-sm hover:bg-white hover:border-primary/30 transition-all"
            >
              <Link href="/custom-order">Custom Bouquet</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
