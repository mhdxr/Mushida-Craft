"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle, Search, ShoppingBag, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/common/section-heading";

const steps = [
  {
    icon: Search,
    title: "Pilih Bouquet",
    description: "Telusuri katalog dan temukan rangkaian favoritmu.",
  },
  {
    icon: MessageCircle,
    title: "Order via WhatsApp",
    description: "Klik tombol order, otomatis terhubung ke admin kami.",
  },
  {
    icon: ShoppingBag,
    title: "Konfirmasi & Bayar",
    description: "Tim kami bantu konfirmasi pesanan dan metode pembayaran.",
  },
  {
    icon: Truck,
    title: "Diantar ke Tujuan",
    description: "Bouquet dirangkai segar dan dikirim same-day delivery.",
  },
];

export function HowToOrder() {
  return (
    <section id="cara-order" className="section-soft py-16 md:py-24">
      <div className="container">
        <SectionHeading
          eyebrow="Cara Order"
          title="Mudah, cepat, dan personal"
          description="Hanya 4 langkah, bouquet sampai ke tangan tersayang."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, idx) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="relative rounded-2xl border border-border/60 bg-white p-6 shadow-sm"
            >
              <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                Step {idx + 1}
              </span>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blush-50 text-primary">
                <s.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-serif text-lg font-semibold">
                {s.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {s.description}
              </p>
            </motion.div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-muted-foreground">
            Butuh request khusus? Kami siap merangkai sesuai keinginanmu.
          </p>
          <Button asChild variant="accent" size="lg">
            <Link href="/custom-order">Buat Custom Bouquet</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
