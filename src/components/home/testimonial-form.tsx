"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  testimonialSchema,
  type TestimonialSchema,
} from "@/lib/validations";
import { toast } from "@/hooks/use-toast";

export function TestimonialForm({ onSuccess }: { onSuccess?: () => void }) {
  const [hoverRating, setHoverRating] = useState(0);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TestimonialSchema>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      name: "",
      role: "",
      message: "",
      rating: 5,
    },
  });

  const rating = watch("rating");

  const onSubmit = handleSubmit(async (data) => {
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          role: data.role || undefined,
          message: data.message,
          rating: data.rating,
        }),
      });
      const json = (await res.json().catch(() => null)) as {
        ok?: boolean;
        message?: string;
      } | null;

      if (!res.ok || !json?.ok) {
        throw new Error(json?.message || "Gagal mengirim testimoni.");
      }

      toast.success(
        json.message ||
          "Terima kasih! Testimoni Anda menunggu moderasi sebelum ditampilkan.",
      );
      reset({ name: "", role: "", message: "", rating: 5 });
      onSuccess?.();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Gagal mengirim testimoni.",
      );
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm md:p-8"
    >
      <div className="mb-5">
        <h3 className="font-serif text-lg font-semibold">
          Bagikan pengalamanmu
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Testimoni akan ditinjau terlebih dahulu sebelum tampil di situs.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="testimonial-name">Nama</Label>
          <Input
            id="testimonial-name"
            placeholder="Nama kamu"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="testimonial-role">
            Peran <span className="text-muted-foreground">(opsional)</span>
          </Label>
          <Input
            id="testimonial-role"
            placeholder="Contoh: Mahasiswi, Customer"
            {...register("role")}
          />
          {errors.role && (
            <p className="text-xs text-destructive">{errors.role.message}</p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Rating</Label>
          <div
            className="flex items-center gap-1"
            role="radiogroup"
            aria-label="Rating bintang"
          >
            {Array.from({ length: 5 }, (_, i) => {
              const value = i + 1;
              const active = value <= (hoverRating || rating);
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={rating === value}
                  aria-label={`${value} bintang`}
                  className="rounded p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  onMouseEnter={() => setHoverRating(value)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() =>
                    setValue("rating", value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                >
                  <Star
                    className={`h-7 w-7 ${
                      active
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/40"
                    }`}
                  />
                </button>
              );
            })}
            <span className="ml-2 text-sm text-muted-foreground">
              {rating}/5
            </span>
          </div>
          {errors.rating && (
            <p className="text-xs text-destructive">{errors.rating.message}</p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="testimonial-message">Testimoni</Label>
          <Textarea
            id="testimonial-message"
            rows={4}
            placeholder="Ceritakan pengalamanmu memesan di Mushida Craft..."
            {...register("message")}
          />
          {errors.message && (
            <p className="text-xs text-destructive">{errors.message.message}</p>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          <Send className="h-4 w-4" />
          {isSubmitting ? "Mengirim..." : "Kirim testimoni"}
        </Button>
      </div>
    </form>
  );
}
