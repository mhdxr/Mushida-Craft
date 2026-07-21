"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef } from "react";
import { Quote, Star } from "lucide-react";
import type { Testimonial } from "@/types";

/** 2 baris — lebih boutique; 3 baris terasa ramai di homepage. */
const ROW_COUNT = 2;
/** Minimal item per baris agar loop marquee terasa penuh. */
const MIN_PER_ROW = 4;
/** Kecepatan geser (px/detik) — beda tipis per baris biar tidak sinkron kaku. */
const ROW_SPEEDS = [34, 28] as const;

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
      className="flex items-center gap-0.5"
      aria-label={`Rating ${rating} dari 5`}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const filled = i < rating;
        return (
          <Star
            key={i}
            className={`h-3 w-3 ${
              filled
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-border"
            }`}
          />
        );
      })}
    </div>
  );
}

/**
 * Kartu compact untuk 2-row marquee.
 * ~288px — sedikit lebih lapang biar terasa premium, tetap kebaca di HP.
 */
function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <article className="group relative flex h-full w-[min(80vw,18rem)] shrink-0 flex-col overflow-hidden rounded-2xl border border-border/50 bg-white/95 p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md hover:shadow-primary/10">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-5 -top-5 h-16 w-16 rounded-full bg-primary/5 transition-transform duration-300 group-hover:scale-110"
      />

      <div className="relative flex items-start justify-between gap-2">
        <StarRating rating={t.rating} />
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blush-50 text-primary/65">
          <Quote className="h-3 w-3" aria-hidden />
        </span>
      </div>

      <blockquote className="relative mt-3 flex-1">
        <p className="line-clamp-3 text-[13px] leading-relaxed text-foreground/80">
          “{t.message}”
        </p>
      </blockquote>

      <footer className="relative mt-4 flex items-center gap-2.5 border-t border-border/40 pt-3.5">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary/15 to-blush-50 text-[10px] font-semibold text-primary shadow-sm ring-2 ring-white">
          {t.avatar ? (
            <Image
              src={t.avatar}
              alt={t.name}
              fill
              sizes="36px"
              className="object-cover"
            />
          ) : (
            <span aria-hidden>{getInitials(t.name) || "?"}</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight">
            {t.name}
          </p>
        </div>
      </footer>
    </article>
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
 * Pause hanya saat hover pointer fine (bukan touch sticky).
 */
function MarqueeRow({
  items,
  direction,
  speed,
  pausedRef,
  rowKey,
}: {
  items: Testimonial[];
  direction: "left" | "right";
  speed: number;
  pausedRef: React.MutableRefObject<boolean>;
  rowKey: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  // Stabilkan dependency: id list, bukan referensi array baru tiap poll.
  // Key stabil: hindari remount loop saat parent kirim array baru isi sama.
  const itemsKey = items.map((t) => t.id).join("|");
  const loop = useMemo(
    () => [...items, ...items],
    // itemsKey merepresentasikan identitas isi; items ikut agar isi loop akurat.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional stable key
    [itemsKey],
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track || items.length === 0) return;

    const dir = direction === "left" ? 1 : -1;
    let last = performance.now();
    let running = true;

    const tick = (now: number) => {
      if (!running) return;
      const dt = Math.min(64, now - last) / 1000;
      last = now;

      if (!pausedRef.current) {
        const half = track.scrollWidth / 2;
        if (half > 1) {
          offsetRef.current += speed * dt * dir;
          // Normalisasi ke [0, half)
          while (offsetRef.current >= half) offsetRef.current -= half;
          while (offsetRef.current < 0) offsetRef.current += half;
          track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    // Recalc saat layout/gambar berubah
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            const half = track.scrollWidth / 2;
            if (half > 1 && offsetRef.current >= half) {
              offsetRef.current %= half;
            }
          })
        : null;
    ro?.observe(track);

    return () => {
      running = false;
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      ro?.disconnect();
    };
    // itemsKey cukup: daftar id sama = konten track sama.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional stable key
  }, [itemsKey, direction, speed, pausedRef]);

  if (items.length === 0) return null;

  return (
    <div className="overflow-hidden">
      <div
        ref={trackRef}
        className="flex w-max gap-3 will-change-transform"
        style={{ transform: "translate3d(0,0,0)" }}
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
 * Pause: hanya hover desktop (pointer fine) — touch tidak membuat pause macet.
 */
export function TestimonialMarquee({ items }: { items: Testimonial[] }) {
  const pausedRef = useRef(false);
  // Key stabil agar poll API tidak mereset baris tanpa perlu.
  const itemsKey = items.map((t) => t.id).join("|");

  const rows = useMemo(
    () => splitIntoRows(items, ROW_COUNT),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional stable key
    [itemsKey],
  );

  // Desktop hover pause only — hindari mouseenter sticky di touch.
  const isFinePointer = () =>
    typeof window !== "undefined" &&
    Boolean(
      window.matchMedia?.("(hover: hover) and (pointer: fine)").matches,
    );

  return (
    <div
      className="testimonial-marquee relative mt-12 space-y-4"
      aria-label="Testimoni pelanggan"
      onMouseEnter={() => {
        if (isFinePointer()) pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
    >
      {rows.map((rowItems, idx) => (
        <MarqueeRow
          key={`row-${idx}`}
          rowKey={`row-${idx}`}
          items={rowItems}
          direction={idx % 2 === 0 ? "left" : "right"}
          speed={ROW_SPEEDS[idx] ?? 36}
          pausedRef={pausedRef}
        />
      ))}
    </div>
  );
}
