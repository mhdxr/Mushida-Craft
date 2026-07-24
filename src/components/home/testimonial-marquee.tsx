"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Testimonial } from "@/types";

/** 2 baris — lebih boutique; 3 baris terasa ramai di homepage. */
const ROW_COUNT = 2;
/** Minimal item per baris agar loop marquee terasa penuh. */
const MIN_PER_ROW = 4;

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-1"
      aria-label={`Rating ${rating} dari 5`}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const filled = i < rating;
        return (
          <Star
            key={i}
            className={`h-3 w-3 ${
              filled
                ? "fill-primary/60 text-primary/60"
                : "fill-transparent text-primary/10"
            }`}
          />
        );
      })}
    </div>
  );
}

/**
 * Kartu boutique untuk 2-row marquee.
 * Didesain menyerupai kartu ucapan (gift card) yang disematkan pada buket.
 */
function TestimonialCard({ t }: { t: Testimonial }) {
  const [open, setOpen] = useState(false);

  // Bagian inti visual dari kartu dipisahkan menjadi konstanta agar dapat digunakan
  // sebagai pemicu (trigger) pada Dialog.
  // Menyusutkan ukuran agar kompak: lebar 18rem (dari 22rem), padding 6 (dari 8)
  const cardContent = (
    <article className="group relative flex h-full w-[min(80vw,18rem)] shrink-0 flex-col overflow-hidden rounded-xl bg-white/70 p-6 shadow-[0_4px_24px_-8px_rgba(255,196,213,0.15)] backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:bg-white/90 hover:shadow-[0_8px_32px_-8px_rgba(255,196,213,0.3)] text-left cursor-pointer">
      {/* Watermark Quote elegan sebagai signature */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-2 -top-4 font-serif text-[6rem] leading-none text-blush-100/50 transition-transform duration-500 group-hover:-translate-y-2 group-hover:text-blush-100/70"
      >
        &ldquo;
      </div>

      <div className="relative z-10 flex flex-col h-full justify-between gap-4">
        <StarRating rating={t.rating} />

        <blockquote className="flex-1">
          {/* Dibatasi maksimal 3 baris teks pada slider agar tidak memakan ruang vertikal */}
          <p className="line-clamp-3 font-serif text-[1rem] italic leading-relaxed text-foreground/80">
            {t.message}
          </p>
        </blockquote>

        <footer className="flex items-center gap-3 pt-4 border-t border-blush-100/50 mt-auto">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blush-50 text-[10px] font-semibold text-primary">
            {t.avatar ? (
              <Image
                src={t.avatar}
                alt={t.name}
                fill
                sizes="36px"
                className="object-cover"
              />
            ) : (
              <span aria-hidden className="font-serif text-xs">{getInitials(t.name) || "?"}</span>
            )}
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-[0.08em] text-foreground/70 uppercase">
              {t.name}
            </p>
          </div>
        </footer>
      </div>
    </article>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* asChild memastikan bahwa DialogTrigger merender <article> langsung tanpa membungkusnya dalam <button> */}
        {cardContent}
      </DialogTrigger>

      {/* Jendela Modal / Popup ketika diklik */}
      <DialogContent className="max-w-xl p-8 border-blush-200/50 sm:p-12">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
             <StarRating rating={t.rating} />
             <div aria-hidden className="font-serif text-6xl leading-none text-blush-200/50">&ldquo;</div>
          </div>

          <blockquote className="my-2">
            <p className="font-serif text-xl italic leading-relaxed text-foreground/90 whitespace-pre-line">
              {t.message}
            </p>
          </blockquote>

          <footer className="flex items-center gap-4 pt-6 mt-2 border-t border-blush-100/50">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blush-50 text-[14px] font-semibold text-primary ring-4 ring-white">
              {t.avatar ? (
                <Image
                  src={t.avatar}
                  alt={t.name}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              ) : (
                <span aria-hidden className="font-serif text-lg">{getInitials(t.name) || "?"}</span>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.1em] text-foreground uppercase">
                {t.name}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Pelanggan Mushida-Craft</p>
            </div>
          </footer>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Sebar item ke N baris secara round-robin agar semua muncul. */
function splitIntoRows(items: Testimonial[], rows: number): Testimonial[][] {
  if (items.length === 0) return Array.from({ length: rows }, () => []);

  const result: Testimonial[][] = Array.from({ length: rows }, () => []);
  items.forEach((item, i) => {
    result[i % rows].push(item);
  });

  const pool = items.length > 0 ? items : [];
  for (let r = 0; r < rows; r++) {
    if (result[r].length === 0 && pool.length > 0) {
      result[r].push(pool[r % pool.length]);
    }
    if (result[r].length > 0) {
      let i = 0;
      while (result[r].length < MIN_PER_ROW) {
        result[r].push(result[r][i % result[r].length]);
        i++;
        if (i > MIN_PER_ROW * 4) break;
      }
    }
  }

  return result;
}

/**
 * Satu baris marquee — arah kiri/kanan.
 * Pause saat hover ditangani oleh parent via tailwind group-hover (hover:pause) di CSS.
 */
function MarqueeRow({
  items,
  direction,
  speed,
  rowKey,
}: {
  items: Testimonial[];
  direction: "left" | "right";
  speed: number;
  rowKey: string;
}) {
  const itemsKey = items.map((t) => t.id).join("|");
  const loop = useMemo(
    () => [...items, ...items],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [itemsKey],
  );

  if (items.length === 0) return null;

  // Hapus blokade 'prefers-reduced-motion' yang menahan animasi
  const animationClass =
    direction === "left" ? "animate-marquee-left" : "animate-marquee-right";

  return (
    <div className="overflow-hidden py-4 w-full" style={{ "--duration": `${speed}s` } as React.CSSProperties}>
      {/* Container ini dibuat 2x lipat lebih lebar agar cukup untuk bergeser setengahnya tanpa putus.
          Ditambahkan items-stretch agar setiap kartu dalam satu baris memiliki tinggi yang sama persis */}
      <div
        className={`flex w-max items-stretch gap-6 ${animationClass} hover:[animation-play-state:paused] group-hover/marquee:[animation-play-state:paused]`}
      >
        {loop.map((t, i) => (
          <TestimonialCard key={`${rowKey}-${t.id}-${i}`} t={t} />
        ))}
      </div>
    </div>
  );
}

/**
 * 2 baris marquee bergiliran.
 */
export function TestimonialMarquee({ items }: { items: Testimonial[] }) {
  const itemsKey = items.map((t) => t.id).join("|");

  const rows = useMemo(
    () => splitIntoRows(items, ROW_COUNT),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [itemsKey],
  );

  // Menambahkan fitur group/marquee pada container utama agar kita
  // bisa melakukan pause secara global, misalnya ketika popup ulasan terbuka.
  // CSS: group-has-[[data-state=open]]:[--play-state:paused]
  return (
    <div
      className="testimonial-marquee group/marquee relative mt-12 space-y-4"
      aria-label="Testimoni pelanggan"
    >
      {rows.map((rowItems, idx) => (
        <MarqueeRow
          key={`row-${idx}`}
          rowKey={`row-${idx}`}
          items={rowItems}
          direction={idx % 2 === 0 ? "left" : "right"}
          speed={idx % 2 === 0 ? 55 : 65} // speed di sini berarti durasi (detik) untuk 1 loop penuh
        />
      ))}
    </div>
  );
}
