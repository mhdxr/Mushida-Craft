"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  customOrderSchema,
  type CustomOrderSchema,
} from "@/lib/validations";
import { AnalyticsEvent, track } from "@/lib/analytics";
import { logInquiry } from "@/lib/log-inquiry";
import { buildCustomOrderMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { toast } from "@/hooks/use-toast";

const bouquetTypes = [
  "Snack",
  "Money",
  "Artifisial",
  "Graduation",
  "Satin",
  "Custom / Lainnya",
];

const budgets = [
  "Di bawah Rp300.000",
  "Rp300.000 - Rp500.000",
  "Rp500.000 - Rp1.000.000",
  "Rp1.000.000 - Rp2.000.000",
  "Di atas Rp2.000.000",
];

const occasions = [
  "Ulang tahun",
  "Anniversary",
  "Wisuda",
  "Wedding / Lamaran",
  "Thank you / Apresiasi",
  "Custom / Lainnya",
];

/** Area same-day ditandai di label — luar area tetap boleh, estimasi via WA. */
const deliveryAreas = [
  "Jakarta Barat (same-day)",
  "Jakarta Pusat (same-day)",
  "Jakarta Selatan",
  "Jakarta Timur",
  "Jakarta Utara",
  "Tangerang / sekitarnya",
  "Bekasi / Depok / lainnya",
];

export function CustomOrderForm() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CustomOrderSchema>({
    resolver: zodResolver(customOrderSchema),
    defaultValues: {
      name: "",
      whatsapp: "",
      bouquetType: "",
      budget: "",
      neededDate: "",
      occasion: "",
      deliveryArea: "",
      notes: "",
    },
  });

  const bouquetType = watch("bouquetType");
  const budget = watch("budget");
  const occasion = watch("occasion");
  const deliveryArea = watch("deliveryArea");

  const onSubmit = (data: CustomOrderSchema) => {
    const url = buildWhatsAppUrl(buildCustomOrderMessage(data));
    track(AnalyticsEvent.SUBMIT_CUSTOM_ORDER, {
      bouquet_type: data.bouquetType,
      budget: data.budget,
      needed_date: data.neededDate,
      occasion: data.occasion,
      delivery_area: data.deliveryArea,
      source: "custom_order_form",
    });
    logInquiry({
      source: "custom_order",
      customerName: data.name,
      customerWa: data.whatsapp,
      notes: data.notes,
      meta: {
        bouquetType: data.bouquetType,
        budget: data.budget,
        neededDate: data.neededDate,
        occasion: data.occasion,
        deliveryArea: data.deliveryArea,
      },
    });
    setSubmitted(true);
    toast.success("Form terkirim. Membuka WhatsApp...");
    if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-7 rounded-2xl bg-white/70 p-6 shadow-[0_4px_32px_-8px_rgba(255,196,213,0.2)] backdrop-blur-md md:p-10"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2.5">
          <Label htmlFor="name" className="font-serif text-base italic text-foreground/80">Nama lengkap</Label>
          <Input
            id="name"
            placeholder="cth. Anindya Putri"
            className="h-11 border-blush-200/50 bg-white/50 focus-visible:ring-primary/30"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2.5">
          <Label htmlFor="whatsapp" className="font-serif text-base italic text-foreground/80">Nomor WhatsApp</Label>
          <Input
            id="whatsapp"
            placeholder="cth. 081234567890"
            inputMode="tel"
            autoComplete="tel"
            className="h-11 border-blush-200/50 bg-white/50 focus-visible:ring-primary/30"
            {...register("whatsapp")}
          />
          {errors.whatsapp && (
            <p className="text-xs text-destructive">
              {errors.whatsapp.message}
            </p>
          )}
        </div>

        <div className="space-y-2.5">
          <Label htmlFor="bouquetType" className="font-serif text-base italic text-foreground/80">Jenis bouquet</Label>
          <Select
            value={bouquetType}
            onValueChange={(v) =>
              setValue("bouquetType", v, { shouldValidate: true })
            }
          >
            <SelectTrigger id="bouquetType" aria-label="Jenis bouquet" className="h-11 border-blush-200/50 bg-white/50">
              <SelectValue placeholder="Pilih jenis bouquet" />
            </SelectTrigger>
            <SelectContent>
              {bouquetTypes.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.bouquetType && (
            <p className="text-xs text-destructive">
              {errors.bouquetType.message}
            </p>
          )}
        </div>

        <div className="space-y-2.5">
          <Label htmlFor="occasion" className="font-serif text-base italic text-foreground/80">Momen</Label>
          <Select
            value={occasion}
            onValueChange={(v) =>
              setValue("occasion", v, { shouldValidate: true })
            }
          >
            <SelectTrigger id="occasion" aria-label="Momen" className="h-11 border-blush-200/50 bg-white/50">
              <SelectValue placeholder="Pilih momen" />
            </SelectTrigger>
            <SelectContent>
              {occasions.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.occasion && (
            <p className="text-xs text-destructive">{errors.occasion.message}</p>
          )}
        </div>

        <div className="space-y-2.5">
          <Label htmlFor="budget" className="font-serif text-base italic text-foreground/80">Budget</Label>
          <Select
            value={budget}
            onValueChange={(v) =>
              setValue("budget", v, { shouldValidate: true })
            }
          >
            <SelectTrigger id="budget" aria-label="Budget" className="h-11 border-blush-200/50 bg-white/50">
              <SelectValue placeholder="Pilih kisaran budget" />
            </SelectTrigger>
            <SelectContent>
              {budgets.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.budget && (
            <p className="text-xs text-destructive">{errors.budget.message}</p>
          )}
        </div>

        <div className="space-y-2.5">
          <Label htmlFor="deliveryArea" className="font-serif text-base italic text-foreground/80">Area pengiriman</Label>
          <Select
            value={deliveryArea}
            onValueChange={(v) =>
              setValue("deliveryArea", v, { shouldValidate: true })
            }
          >
            <SelectTrigger id="deliveryArea" aria-label="Area pengiriman" className="h-11 border-blush-200/50 bg-white/50">
              <SelectValue placeholder="Pilih area tujuan" />
            </SelectTrigger>
            <SelectContent>
              {deliveryAreas.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.deliveryArea && (
            <p className="text-xs text-destructive">
              {errors.deliveryArea.message}
            </p>
          )}
          <p className="text-[11px] text-muted-foreground">
            Same-day: Jakarta Barat & Pusat (order sebelum 15.00). Area lain
            tetap bisa — estimasi via WhatsApp.
          </p>
        </div>

        <div className="space-y-2.5 md:col-span-2">
          <Label htmlFor="neededDate" className="font-serif text-base italic text-foreground/80">Tanggal dibutuhkan</Label>
          <Input
            id="neededDate"
            type="date"
            min={new Date().toLocaleDateString("en-CA")}
            className="h-11 border-blush-200/50 bg-white/50 focus-visible:ring-primary/30"
            {...register("neededDate")}
          />
          {errors.neededDate && (
            <p className="text-xs text-destructive">
              {errors.neededDate.message}
            </p>
          )}
        </div>

        <div className="space-y-2.5 md:col-span-2">
          <Label htmlFor="notes" className="font-serif text-base italic text-foreground/80">Catatan tambahan <span className="font-sans text-xs not-italic text-muted-foreground">(opsional)</span></Label>
          <Textarea
            id="notes"
            placeholder="Misal: warna favorit, tema, alamat lengkap, dll"
            className="border-blush-200/50 bg-white/50 focus-visible:ring-primary/30 resize-none"
            {...register("notes")}
          />
          {errors.notes && (
            <p className="text-xs text-destructive">{errors.notes.message}</p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="w-full rounded-full bg-primary/90 py-6 text-sm font-semibold tracking-wide hover:bg-primary shadow-sm transition-all hover:scale-[1.02]"
      >
        <MessageCircle className="mr-2 h-4 w-4" />
        Kirim ke WhatsApp
      </Button>

      {submitted && (
        <p className="rounded-xl bg-emerald-50 p-3 text-center text-xs text-emerald-700">
          ✨ Form berhasil dikirim! WhatsApp terbuka di tab baru. Cek
          notifikasi WhatsApp-mu ya.
        </p>
      )}
    </form>
  );
}
