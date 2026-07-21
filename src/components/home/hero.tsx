import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroGreeting } from "@/components/home/hero-greeting";
import { fetchFeaturedProducts } from "@/lib/product-api";
import { fetchApprovedRatingStats } from "@/lib/testimonial-api";

// Teks promo bisa dioverride via env tanpa mengubah kode
// (NEXT_PUBLIC_* di-inline saat build — ganti env + redeploy, tanpa edit file).
const PROMO_LABEL =
  process.env.NEXT_PUBLIC_HERO_PROMO_LABEL || "Promo bulan ini";
const PROMO_TEXT =
  process.env.NEXT_PUBLIC_HERO_PROMO_TEXT || "Free greeting card 💌";

/** Fallback terakhir bila env & featured product kosong. */
const DEFAULT_HERO_IMAGE = {
  src: "https://ozsrkctqxlevsetqivwl.supabase.co/storage/v1/object/public/product-images/4f9a86b0-6e0e-4d34-9c84-2fc59bb26768.jpg",
  alt: "Hand bouquet Lily",
};

const DELIVERED_COUNT =
  process.env.NEXT_PUBLIC_HERO_DELIVERED_COUNT || "500+";
const DELIVERY_TIME =
  process.env.NEXT_PUBLIC_HERO_DELIVERY_TIME || "3 Jam";

async function resolveHeroImage(): Promise<{ src: string; alt: string }> {
  const envUrl = process.env.NEXT_PUBLIC_HERO_IMAGE_URL?.trim();
  if (envUrl) {
    return {
      src: envUrl,
      alt:
        process.env.NEXT_PUBLIC_HERO_IMAGE_ALT?.trim() ||
        "Bouquet unggulan Mushida Craft",
    };
  }

  try {
    const featured = await fetchFeaturedProducts(1);
    const product = featured[0];
    if (product?.images?.[0]) {
      return { src: product.images[0], alt: product.name };
    }
  } catch {
    // Supabase belum siap — pakai default.
  }

  return DEFAULT_HERO_IMAGE;
}

async function resolveHeroRating(): Promise<string> {
  try {
    const stats = await fetchApprovedRatingStats();
    if (stats && stats.count > 0) {
      // Selalu 1 desimal (4.9★ / 5.0★) biar lebar badge stabil.
      return `${stats.average.toFixed(1)}★`;
    }
  } catch {
    // ignore
  }
  return process.env.NEXT_PUBLIC_HERO_RATING_FALLBACK || "4.9★";
}

export async function Hero() {
  const [image, ratingLabel] = await Promise.all([
    resolveHeroImage(),
    resolveHeroRating(),
  ]);

  return (
    <section className="hero-gradient relative overflow-hidden">
      <div className="container relative grid items-center gap-10 py-14 md:grid-cols-2 md:gap-12 md:py-24 lg:py-28">
        <div className="space-y-6">
          <HeroGreeting />

          <h1 className="font-serif text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl lg:text-6xl">
            Setiap rangkaian{" "}
            <span className="italic text-primary">bercerita</span>, untuk
            momen tak terlupakan.
          </h1>
          <p className="max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
            Bouquet handmade premium — snack, money, artifisial, graduation,
            dan satin — dirangkai personal untuk momen spesial Anda.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button asChild size="lg" className="tracking-wide">
              <Link href="/katalog">
                Lihat Katalog
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-border/70 bg-white/70 tracking-wide backdrop-blur-sm"
            >
              <Link href="/custom-order">Custom Bouquet</Link>
            </Button>
          </div>

          {/* Promo chip — mobile only */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white/70 px-3.5 py-1.5 text-xs tracking-wide shadow-sm backdrop-blur-sm sm:hidden">
            <span className="text-muted-foreground">{PROMO_LABEL}</span>
            <span className="text-border">·</span>
            <span className="font-medium text-foreground">{PROMO_TEXT}</span>
          </div>

          {/* Trust metrics */}
          <div className="flex flex-wrap items-end gap-x-8 gap-y-4 pt-2 text-sm text-muted-foreground">
            <div>
              <p className="font-serif text-2xl font-semibold tracking-tight text-foreground md:text-[1.75rem]">
                {DELIVERED_COUNT}
              </p>
              <p className="mt-0.5 text-xs tracking-wide">Bouquet terkirim</p>
            </div>
            <div className="hidden h-11 w-px bg-border/70 sm:block" />
            <div>
              <p className="font-serif text-2xl font-semibold tracking-tight text-foreground md:text-[1.75rem]">
                {ratingLabel}
              </p>
              <p className="mt-0.5 text-xs tracking-wide">Rating pelanggan</p>
            </div>
            <div className="hidden h-11 w-px bg-border/70 sm:block" />
            <div>
              <p className="font-serif text-2xl font-semibold tracking-tight text-foreground md:text-[1.75rem]">
                {DELIVERY_TIME}
              </p>
              <p className="mt-0.5 text-xs tracking-wide">Same-day delivery</p>
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md md:max-w-none">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] shadow-[0_24px_60px_-20px_rgba(231,110,140,0.35)] ring-1 ring-primary/10">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          {/* Kartu promo mengambang — desktop/tablet */}
          <div className="absolute -bottom-5 -left-3 hidden rounded-2xl border border-border/50 bg-white/95 px-5 py-4 shadow-lg shadow-primary/10 backdrop-blur-md sm:block">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {PROMO_LABEL}
            </p>
            <p className="mt-1 font-serif text-lg font-semibold tracking-tight">
              {PROMO_TEXT}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
