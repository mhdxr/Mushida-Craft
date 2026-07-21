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
      notes: "",
    },
  });

  const bouquetType = watch("bouquetType");
  const budget = watch("budget");

  const onSubmit = (data: CustomOrderSchema) => {
    const url = buildWhatsAppUrl(buildCustomOrderMessage(data));
    track(AnalyticsEvent.SUBMIT_CUSTOM_ORDER, {
      bouquet_type: data.bouquetType,
      budget: data.budget,
      needed_date: data.neededDate,
      source: "custom_order_form",
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
      className="space-y-5 rounded-2xl border border-border/60 bg-white p-6 shadow-sm md:p-8"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nama lengkap</Label>
          <Input
            id="name"
            placeholder="cth. Anindya Putri"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsapp">Nomor WhatsApp</Label>
          <Input
            id="whatsapp"
            placeholder="cth. 081234567890"
            {...register("whatsapp")}
          />
          {errors.whatsapp && (
            <p className="text-xs text-destructive">
              {errors.whatsapp.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Jenis bouquet</Label>
          <Select
            value={bouquetType}
            onValueChange={(v) =>
              setValue("bouquetType", v, { shouldValidate: true })
            }
          >
            <SelectTrigger>
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

        <div className="space-y-2">
          <Label>Budget</Label>
          <Select
            value={budget}
            onValueChange={(v) =>
              setValue("budget", v, { shouldValidate: true })
            }
          >
            <SelectTrigger>
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

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="neededDate">Tanggal dibutuhkan</Label>
          <Input
            id="neededDate"
            type="date"
            {...register("neededDate")}
          />
          {errors.neededDate && (
            <p className="text-xs text-destructive">
              {errors.neededDate.message}
            </p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes">Catatan tambahan (opsional)</Label>
          <Textarea
            id="notes"
            placeholder="Misal: warna favorit, tema, jenis bunga, dll"
            {...register("notes")}
          />
          {errors.notes && (
            <p className="text-xs text-destructive">{errors.notes.message}</p>
          )}
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        <MessageCircle className="h-4 w-4" />
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
