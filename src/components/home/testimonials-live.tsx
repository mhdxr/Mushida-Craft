"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TestimonialMarquee } from "@/components/home/testimonial-marquee";
import { testimonials as seedTestimonials } from "@/data/testimonials";
import type { Testimonial } from "@/types";

/**
 * Ambil testimoni approved dari API (DB) di client.
 * - Poll ringan setelah admin setujui
 * - Seed hanya bila API gagal (bukan bila DB kosong)
 * - Hindari setState berulang dengan data sama (bikin marquee “macet”/reset)
 */
export function TestimonialsLive({
  initialItems,
}: {
  initialItems: Testimonial[];
}) {
  const [items, setItems] = useState<Testimonial[]>(initialItems);
  const [source, setSource] = useState<"ssr" | "db" | "seed" | "empty">("ssr");
  const lastKeyRef = useRef(initialItems.map((t) => t.id).join("|"));

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
        setItems((prev) => {
          if (prev.length > 0) return prev;
          setSource("seed");
          return seedTestimonials;
        });
        return;
      }

      if (json.testimonials.length > 0) {
        const key = json.testimonials.map((t) => t.id).join("|");
        if (key !== lastKeyRef.current) {
          lastKeyRef.current = key;
          setItems(json.testimonials);
        }
        setSource("db");
      } else {
        lastKeyRef.current = "";
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
    const id = window.setInterval(() => {
      void refresh();
    }, 45_000);
    const onFocus = () => {
      void refresh();
    };
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  if (source === "empty") {
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

  if (items.length === 0) {
    // Masih SSR/loading — jangan flash empty.
    return null;
  }

  return <TestimonialMarquee items={items} />;
}
