import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroGreeting } from "@/components/home/hero-greeting";
import { categoryMap } from "@/data/categories";
import { selectPromoProduct } from "@/data/products";
import { fetchProducts } from "@/lib/product-api";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=1200&q=80";

function promoEyebrow(product: Product): string {
  if (product.badge === "new") return "Baru di katalog";
  if (product.badge === "best-seller") return "Best seller";
  return "Unggulan bulan ini";
}

export async function Hero() {
  let promo: Product | null = null;
  try {
    const all = await fetchProducts();
    promo = selectPromoProduct(all);
  } catch (err) {
    console.error("Hero: gagal load promo dari Supabase", err);
  }

  const imageSrc = promo?.images?.[0] || FALLBACK_IMAGE;
  const imageAlt = promo
    ? `${promo.name} — Mushida Craft`
    : "Rangkaian premium Mushida Craft";
  const categoryName = promo
    ? categoryMap[promo.category]?.name ?? promo.category
    : null;

  return (
    <section className="hero-gradient relative overflow-hidden">
      <div className="container relative grid items-center gap-12 py-16 md:grid-cols-2 md:py-24 lg:py-28">
        <div className="space-y-6">
          <HeroGreeting />
          <h1 className="font-serif text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl lg:text-6xl">
            Setiap rangkaian{" "}
            <span className="italic text-primary">bercerita</span>, untuk momen
            tak terlupakan.
          </h1>
          <p className="max-w-lg text-base text-muted-foreground md:text-lg">
            Snack, Money, Artifisial, Graduation, dan Satin — Mushida Craft
            menghadirkan rangkaian premium dengan sentuhan personal untuk momen
            spesial Anda.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button asChild size="lg">
              <Link href="/katalog">
                Lihat Katalog
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/custom-order">Custom Order</Link>
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
              src={imageSrc}
              alt={imageAlt}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          {/* Kartu promo: produk nyata dari DB, bukan copy fiktif */}
          {promo ? (
            <Link
              href={`/produk/${promo.slug}`}
              className="absolute -bottom-6 -left-4 hidden max-w-[16rem] rounded-2xl border border-border/60 bg-white/95 p-4 shadow-lg backdrop-blur-sm transition-transform hover:-translate-y-0.5 hover:shadow-xl sm:block"
            >
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {promoEyebrow(promo)}
                {categoryName ? ` · ${categoryName}` : ""}
              </p>
              <p className="mt-0.5 line-clamp-2 font-serif text-lg font-semibold leading-snug">
                {promo.name}
              </p>
              <p className="mt-1 text-sm font-medium text-primary">
                {formatCurrency(promo.price)}
              </p>
            </Link>
          ) : (
            <Link
              href="/custom-order"
              className="absolute -bottom-6 -left-4 hidden max-w-[16rem] rounded-2xl border border-border/60 bg-white/95 p-4 shadow-lg backdrop-blur-sm transition-transform hover:-translate-y-0.5 hover:shadow-xl sm:block"
            >
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Custom order
              </p>
              <p className="mt-0.5 font-serif text-lg font-semibold leading-snug">
                Request rangkaian sesuai momenmu
              </p>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
