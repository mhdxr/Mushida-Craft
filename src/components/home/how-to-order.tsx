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
    <section id="cara-order" className="section-soft py-16 md:py-24">
      <div className="container">
        <SectionHeading
          eyebrow="Cara order"
          title="Sederhana, personal, tanpa ribet"
          description="Empat langkah elegan dari pilih rangkaian hingga sampai ke tangan tersayang."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, idx) => (
            <div
              key={s.title}
              className="relative rounded-2xl border border-border/50 bg-white/90 p-7 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blush-50 text-primary">
                  <s.icon className="h-5 w-5" />
                </span>
                <span className="font-serif text-sm tracking-[0.18em] text-primary/50">
                  0{idx + 1}
                </span>
              </div>
              <h3 className="mt-6 font-serif text-lg font-semibold tracking-tight">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {s.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center gap-5 text-center">
          <div className="max-w-md space-y-2">
            <p className="font-serif text-xl font-semibold tracking-tight md:text-2xl">
              Siap merangkai momenmu?
            </p>
            <p className="text-sm text-muted-foreground">
              Mulai dari katalog siap kirim, atau request custom sesuai ceritamu.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="min-w-[10.5rem] tracking-wide">
              <Link href="/katalog">Lihat Katalog</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="min-w-[10.5rem] border-border/70 bg-white/70 tracking-wide"
            >
              <Link href="/custom-order">Custom Bouquet</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
