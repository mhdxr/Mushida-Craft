"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  alt: string;
}

export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const list = images.length > 0 ? images : ["/placeholder.png"];

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-border/50 bg-secondary/60">
        <Image
          src={list[active]}
          alt={alt}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
      {list.length > 1 && (
        <div
          className="grid grid-cols-4 gap-3"
          role="listbox"
          aria-label={`Galeri foto ${alt}`}
        >
          {list.map((src, idx) => {
            const selected = active === idx;
            return (
              <button
                key={`${src}-${idx}`}
                type="button"
                role="option"
                aria-selected={selected}
                aria-label={`${alt} — foto ${idx + 1} dari ${list.length}`}
                onClick={() => setActive(idx)}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-xl border-2 bg-secondary transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  selected
                    ? "border-primary shadow-md shadow-primary/15"
                    : "border-transparent opacity-70 hover:opacity-100",
                )}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
