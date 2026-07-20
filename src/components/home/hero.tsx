"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTimeGreeting } from "@/lib/greeting";

export function Hero() {
  // Sapaan di-set setelah mount agar SSR & client markup identik
  // (hindari hydration mismatch yang bisa mematikan event handler).
  const [greeting, setGreeting] = useState("Halo");

  useEffect(() => {
    setGreeting(getTimeGreeting());
  }, []);

  return (
    <section className="hero-gradient relative overflow-hidden">
      <div className="container relative grid items-center gap-12 py-16 md:grid-cols-2 md:py-24 lg:py-28">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/70 px-4 py-1.5 text-xs font-medium text-primary backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            {greeting} · Hand-tied bouquet artisan
          </div>
          <h1 className="font-serif text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl lg:text-6xl">
            Setiap rangkaian{" "}
            <span className="italic text-primary">bercerita</span>, untuk
            momen tak terlupakan.
          </h1>
          <p className="max-w-lg text-base text-muted-foreground md:text-lg">
            Buket snack, money, artifisial, graduation, dan bunga satin —
            Mushida Craft menghadirkan rangkaian premium dengan sentuhan
            personal untuk momen spesial Anda.
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
        </div>

        <div className="relative">
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
          <div className="absolute -bottom-6 -left-4 hidden rounded-2xl border border-border/60 bg-white/95 p-4 shadow-lg backdrop-blur-sm sm:block">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Promo bulan ini
            </p>
            <p className="font-serif text-xl font-semibold">
              Free greeting card 💌
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
