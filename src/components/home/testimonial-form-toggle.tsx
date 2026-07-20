"use client";

import { useState } from "react";
import { MessageSquarePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TestimonialForm } from "@/components/home/testimonial-form";

export function TestimonialFormToggle() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <div className="flex justify-center">
        <Button variant="outline" onClick={() => setOpen(true)}>
          <MessageSquarePlus className="h-4 w-4" />
          Bagikan pengalamanmu
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-3 flex justify-end">
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
