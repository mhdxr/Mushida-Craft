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
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-border/60 bg-secondary">
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
        <div className="grid grid-cols-4 gap-3">
          {list.map((src, idx) => (
            <button
              key={`${src}-${idx}`}
              onClick={() => setActive(idx)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-xl border-2 bg-secondary transition-all",
                active === idx
                  ? "border-primary shadow-md shadow-primary/15"
                  : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              <Image
                src={src}
                alt={`${alt} ${idx + 1}`}
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
