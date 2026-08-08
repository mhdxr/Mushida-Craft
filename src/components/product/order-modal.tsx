"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { placeOrder, buildProductOrderPayload } from "@/lib/order-api";
import { AnalyticsEvent, track } from "@/lib/analytics";
import { logInquiry } from "@/lib/log-inquiry";
import type { Product } from "@/types";

interface OrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  /** Source inquiry — dari OrderButton (pdp_inline) atau StickyOrderBar (pdp_sticky). */
  inquirySource: "pdp_inline" | "pdp_sticky";
  onSkip?: () => void;
}

export function OrderModal({
  open,
  onOpenChange,
  product,
  inquirySource,
  onSkip,
}: OrderModalProps) {
  const [name, setName] = useState("");
  const [wa, setWa] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const openWhatsApp = (url: string) => {
    if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const handleSkip = () => {
    onSkip?.();
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = buildProductOrderPayload(product);
    const result = await placeOrder({
      ...payload,
      customerName: name.trim() || product.name,
      customerWa: wa.trim(),
    });

    // Catat inquiry (fire-and-forget) — data tetap masuk pipeline admin.
    logInquiry({
      source: inquirySource,
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      productPrice: product.price,
      customerName: name.trim() || undefined,
      customerWa: wa.trim() || undefined,
      meta: { category: product.category },
    });

    track(AnalyticsEvent.CLICK_WA_PRODUCT, {
      product_id: product.id,
      product_slug: product.slug,
      product_name: product.name,
      price: product.price,
      category: product.category,
      source: inquirySource,
    });

    setSubmitting(false);
    onOpenChange(false);

    if (result.ok) {
      toast.success("Order tersimpan. Membuka WhatsApp...");
    } else {
      // API tidak tersedia — link lokal tetap dibuka (perilaku lama).
      toast.success("Membuka WhatsApp...");
    }
    openWhatsApp(result.waLink);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            Order via WhatsApp
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Isi nama & nomor WhatsApp supaya kami bisa konfirmasi lebih cepat.
            Bisa dilewati — WhatsApp tetap terbuka.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="order-name">Nama</Label>
            <Input
              id="order-name"
              placeholder="cth. Anindya Putri"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="order-wa">Nomor WhatsApp</Label>
            <Input
              id="order-wa"
              placeholder="cth. 081234567890"
              inputMode="tel"
              autoComplete="tel"
              value={wa}
              onChange={(e) => setWa(e.target.value)}
            />
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={handleSkip}
              disabled={submitting}
            >
              Lewati
            </Button>
            <Button type="submit" disabled={submitting}>
              <MessageCircle className="mr-2 h-4 w-4" />
              {submitting ? "Menyimpan..." : "Lanjut ke WhatsApp"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
