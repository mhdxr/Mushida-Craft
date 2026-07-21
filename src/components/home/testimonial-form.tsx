"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Send, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  testimonialSchema,
  type TestimonialSchema,
} from "@/lib/validations";
import { AnalyticsEvent, track } from "@/lib/analytics";
import { MAX_AVATAR_FILE_SIZE } from "@/lib/testimonial-avatar";
import { toast } from "@/hooks/use-toast";

const ACCEPTED_AVATAR_TYPES = "image/jpeg,image/png,image/webp";

export function TestimonialForm({ onSuccess }: { onSuccess?: () => void }) {
  const [hoverRating, setHoverRating] = useState(0);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      message: "",
      rating: 5,
    },
  });

  const rating = watch("rating");

  // Bersihkan object URL preview saat unmount / ganti file.
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const clearAvatar = () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(null);
    setAvatarPreview(null);
    setAvatarError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      clearAvatar();
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setAvatarError("Format foto: JPEG, PNG, atau WebP.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_AVATAR_FILE_SIZE) {
      setAvatarError("Foto maksimal 1 MB.");
      e.target.value = "";
      return;
    }

    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarError(null);
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      // multipart agar bisa kirim foto; tanpa foto tetap FormData (sederhana).
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("message", data.message);
      formData.append("rating", String(data.rating));
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const res = await fetch("/api/testimonials", {
        method: "POST",
        body: formData,
      });
      const json = (await res.json().catch(() => null)) as {
        ok?: boolean;
        message?: string;
      } | null;

      if (!res.ok || !json?.ok) {
        throw new Error(json?.message || "Gagal mengirim testimoni.");
      }

      track(AnalyticsEvent.SUBMIT_TESTIMONIAL, {
        rating: data.rating,
        has_avatar: Boolean(avatarFile),
        source: "homepage_form",
      });

      toast.success(
        json.message ||
          "Terima kasih! Testimoni Anda menunggu moderasi sebelum ditampilkan.",
      );
      reset({ name: "", message: "", rating: 5 });
      clearAvatar();
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
      className="relative overflow-hidden rounded-2xl border border-border/60 bg-white p-6 shadow-sm md:p-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/5"
      />

      <div className="relative mb-6">
        <h3 className="font-serif text-xl font-semibold tracking-tight">
          Bagikan pengalamanmu
        </h3>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Testimoni akan ditinjau terlebih dahulu sebelum tampil di situs.
        </p>
      </div>

      <div className="relative grid gap-5">
        {/* Foto profil opsional */}
        <div className="space-y-2">
          <Label>
            Foto profil{" "}
            <span className="text-muted-foreground">(opsional)</span>
          </Label>
          <div className="flex items-center gap-4">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border/60 bg-secondary/50 text-muted-foreground">
              {avatarPreview ? (
                // eslint-disable-next-line @next/next/no-img-element -- blob: preview, bukan remote URL
                <img
                  src={avatarPreview}
                  alt="Preview foto profil"
                  className="h-full w-full object-cover"
                />
              ) : (
                <Camera className="h-5 w-5" aria-hidden />
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_AVATAR_TYPES}
                className="sr-only"
                id="testimonial-avatar"
                onChange={onAvatarChange}
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-4 w-4" />
                  {avatarFile ? "Ganti foto" : "Pilih foto"}
                </Button>
                {avatarFile ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearAvatar}
                  >
                    <X className="h-4 w-4" />
                    Hapus
                  </Button>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">
                JPEG/PNG/WebP · maks. 1 MB · tanpa foto pakai inisial nama
              </p>
              {avatarError ? (
                <p className="text-xs text-destructive">{avatarError}</p>
              ) : null}
            </div>
          </div>
        </div>

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
          <Label>Rating</Label>
          <div
            className="flex items-center gap-1 rounded-xl border border-border/60 bg-secondary/40 px-3 py-2.5"
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
                  className="rounded-md p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
                    className={`h-7 w-7 transition-colors ${
                      active
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/35"
                    }`}
                  />
                </button>
              );
            })}
            <span className="ml-2 text-sm font-medium text-muted-foreground">
              {rating}/5
            </span>
          </div>
          {errors.rating && (
            <p className="text-xs text-destructive">{errors.rating.message}</p>
          )}
        </div>

        <div className="space-y-2">
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

      <div className="relative mt-6 flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          <Send className="h-4 w-4" />
          {isSubmitting ? "Mengirim..." : "Kirim testimoni"}
        </Button>
      </div>
    </form>
  );
}
