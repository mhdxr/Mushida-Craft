"use client";

import { useState } from "react";
import { X, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TestimonialForm } from "@/components/home/testimonial-form";

export function TestimonialFormToggle() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <div className="flex flex-col items-center gap-4 text-center mt-6">
        <p className="font-serif text-xl italic text-foreground/80">
          Apakah karya kami pernah menjadi bagian dari momen spesial Anda?
        </p>
        <Button
          onClick={() => setOpen(true)}
          className="rounded-full bg-primary/90 px-8 py-6 text-sm font-semibold tracking-wide hover:bg-primary shadow-sm transition-all hover:scale-105"
        >
          <PenLine className="mr-2 h-4 w-4" />
          Bagikan Cerita Anda
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl animate-fade-in relative overflow-hidden rounded-2xl bg-white/70 p-6 sm:p-10 shadow-[0_4px_32px_-8px_rgba(255,196,213,0.2)] border border-blush-100/50 backdrop-blur-md mt-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-serif text-2xl font-semibold">Tinggalkan Pesan</h3>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            Pesan Anda akan masuk ke dalam antrean moderasi kami sebelum dirangkai ke dalam buku tamu digital kami.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full text-muted-foreground hover:bg-blush-50 hover:text-primary shrink-0"
          onClick={() => setOpen(false)}
          title="Batal"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Batal</span>
        </Button>
      </div>
      <TestimonialForm onSuccess={() => setOpen(false)} />
    </div>
  );
}
