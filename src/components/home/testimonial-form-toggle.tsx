"use client";

import { useState } from "react";
import { MessageSquarePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TestimonialForm } from "@/components/home/testimonial-form";

export function TestimonialFormToggle() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-sm text-muted-foreground">
          Pernah pesan di Mushida Craft? Ceritakan pengalamanmu.
        </p>
        <Button variant="outline" size="lg" onClick={() => setOpen(true)}>
          <MessageSquarePlus className="h-4 w-4" />
          Bagikan pengalamanmu
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Tulis testimoni — kami tinjau dulu sebelum ditampilkan.
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setOpen(false)}
        >
          <X className="h-4 w-4" />
          Tutup
        </Button>
      </div>
      <TestimonialForm onSuccess={() => setOpen(false)} />
    </div>
  );
}
