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
          "Terima kasih! Testimoni kamu masuk antrean moderasi. Setelah admin setujui, akan tampil di homepage.",
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
      className="relative"
    >
      <div className="relative grid gap-8">
        {/* Foto profil opsional */}
        <div className="space-y-3">
          <Label className="font-serif text-lg italic text-foreground/80">
            Foto Profil{" "}
            <span className="font-sans text-xs not-italic text-muted-foreground ml-1">(opsional)</span>
          </Label>
          <div className="flex items-center gap-5">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-blush-200/60 bg-blush-50/50 text-primary/60">
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
                  className="border-blush-200/60 hover:bg-blush-50 hover:text-primary transition-colors text-xs"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-3.5 w-3.5 mr-1" />
                  {avatarFile ? "Ganti" : "Pilih foto"}
                </Button>
                {avatarFile ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-xs"
                    onClick={clearAvatar}
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Hapus
                  </Button>
                ) : null}
              </div>
              <p className="text-[11px] text-muted-foreground/70">
                Maks. 1 MB (JPEG/PNG). Inisial nama akan digunakan jika kosong.
              </p>
              {avatarError ? (
                <p className="text-xs text-destructive mt-1">{avatarError}</p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="testimonial-name" className="font-serif text-lg italic text-foreground/80">Nama Anda</Label>
          <Input
            id="testimonial-name"
            placeholder="Tuliskan nama Anda"
            className="border-blush-200/50 focus-visible:ring-primary/30 h-11 bg-white/50"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-3">
          <Label className="font-serif text-lg italic text-foreground/80">Beri Nilai Bintang</Label>
          <div
            className="flex items-center gap-1.5"
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
                  className="rounded-full p-1 transition-all duration-300 hover:scale-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
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
                    className={`h-8 w-8 transition-colors duration-300 ${
                      active
                        ? "fill-primary/70 text-primary/70 drop-shadow-[0_2px_8px_rgba(255,196,213,0.5)]"
                        : "text-blush-200/60"
                    }`}
                    strokeWidth={active ? 1 : 1.5}
                  />
                </button>
              );
            })}
          </div>
          {errors.rating && (
            <p className="text-xs text-destructive">{errors.rating.message}</p>
          )}
        </div>

        <div className="space-y-3">
          <Label htmlFor="testimonial-message" className="font-serif text-lg italic text-foreground/80">Pesan Anda</Label>
          <Textarea
            id="testimonial-message"
            rows={5}
            className="border-blush-200/50 focus-visible:ring-primary/30 bg-white/50 resize-none"
            placeholder="Goreskan pengalaman Anda menerima atau memesan buket dari Mushida Craft..."
            {...register("message")}
          />
          {errors.message && (
            <p className="text-xs text-destructive">{errors.message.message}</p>
          )}
        </div>
      </div>

      <div className="relative mt-10 flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-primary/90 px-8 py-6 text-sm font-semibold tracking-wide hover:bg-primary shadow-sm transition-all hover:scale-105"
        >
          <Send className="mr-2 h-4 w-4" />
          {isSubmitting ? "Mengirim Pesan..." : "Kirim Pesan"}
        </Button>
      </div>
    </form>
  );
}
