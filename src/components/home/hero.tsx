"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="hero-gradient relative overflow-hidden">
      <div className="container relative grid items-center gap-12 py-16 md:grid-cols-2 md:py-24 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/70 px-4 py-1.5 text-xs font-medium text-primary backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Hand-tied bouquet artisan
          </div>
          <h1 className="font-serif text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl lg:text-6xl">
            Setiap rangkaian{" "}
            <span className="italic text-primary">bercerita</span>, untuk
            momen tak terlupakan.
          </h1>
          <p className="max-w-lg text-base text-muted-foreground md:text-lg">
            Dari hand-bouquet klasik hingga rangkaian wedding mewah —
            Mushida menghadirkan bunga premium dengan sentuhan personal
            untuk setiap kisah Anda.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button asChild size="lg">
              <Link href="/katalog">
                Lihat Katalog
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/custom-order">Custom Bouquet</Link>
            </Button>
          </div>
          <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
            <div>
              <p className="font-serif text-2xl font-semibold text-foreground">
                500+
              </p>
              <p>Bouquet terkirim</p>
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <p className="font-serif text-2xl font-semibold text-foreground">
                4.9★
              </p>
              <p>Rating pelanggan</p>
            </div>
            <div className="hidden h-10 w-px bg-border sm:block" />
            <div className="hidden sm:block">
              <p className="font-serif text-2xl font-semibold text-foreground">
                3 Jam
              </p>
              <p>Same-day delivery</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-xl shadow-primary/20">
            <Image
              src="https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=1200&q=80"
              alt="Hand bouquet elegan"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="absolute -bottom-6 -left-4 hidden rounded-2xl border border-border/60 bg-white/95 p-4 shadow-lg backdrop-blur-sm sm:block"
          >
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Promo bulan ini
            </p>
            <p className="font-serif text-xl font-semibold">
              Free greeting card 💌
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
