"use client";

import { useCallback, useEffect, useState } from "react";
import { TestimonialMarquee } from "@/components/home/testimonial-marquee";
import { testimonials as seedTestimonials } from "@/data/testimonials";
import type { Testimonial } from "@/types";

/**
 * Ambil testimoni approved dari API (DB) di client.
 * - Tidak tergantung ISR homepage 5 menit
 * - Poll ringan agar setelah admin setujui, homepage ikut update
 * - Seed hanya dipakai bila API gagal (bukan bila DB kosong)
 */
export function TestimonialsLive({
  initialItems,
}: {
  /** SSR snapshot (approved / seed) untuk first paint. */
  initialItems: Testimonial[];
}) {
  const [items, setItems] = useState<Testimonial[]>(initialItems);
  const [source, setSource] = useState<"ssr" | "db" | "seed" | "empty">("ssr");

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/testimonials?limit=60", {
        cache: "no-store",
      });
      const json = (await res.json().catch(() => null)) as {
        ok?: boolean;
        testimonials?: Testimonial[];
      } | null;

      if (!res.ok || !json?.ok || !Array.isArray(json.testimonials)) {
        // API gagal — fallback seed hanya jika belum ada apa-apa.
        setItems((prev) => {
          if (prev.length > 0) return prev;
          setSource("seed");
          return seedTestimonials;
        });
        return;
      }

      if (json.testimonials.length > 0) {
        setItems(json.testimonials);
        setSource("db");
      } else {
        // DB hidup tapi belum ada approved — jangan pakai seed palsu.
        setItems([]);
        setSource("empty");
      }
    } catch {
      setItems((prev) => {
        if (prev.length > 0) return prev;
        setSource("seed");
        return seedTestimonials;
      });
    }
  }, []);

  useEffect(() => {
    void refresh();
    // Poll 45s — cukup "realtime" untuk moderasi tanpa websocket.
    const id = window.setInterval(() => {
      void refresh();
    }, 45_000);
    // Refresh saat tab fokus kembali (admin approve di tab lain).
    const onFocus = () => {
      void refresh();
    };
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  if (source === "empty" || items.length === 0) {
    return (
      <div className="container mt-12">
        <div className="rounded-2xl border border-dashed border-border/70 bg-white/70 px-6 py-12 text-center">
          <p className="font-serif text-lg font-semibold tracking-tight">
            Belum ada testimoni tayang
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Testimoni yang dikirim masuk antrean moderasi. Setelah admin
            menyetujui, rangkaian cerita pelanggan akan tampil di sini secara
            otomatis.
          </p>
        </div>
      </div>
    );
  }

  return <TestimonialMarquee items={items} />;
}
