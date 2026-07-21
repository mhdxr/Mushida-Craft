"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnalyticsEvent, track } from "@/lib/analytics";
import {
  buildProductOrderMessage,
  buildWhatsAppUrl,
} from "@/lib/whatsapp";
import type { Product } from "@/types";

interface OrderButtonProps {
  product: Product;
  className?: string;
  size?: "default" | "sm" | "lg";
}

export function OrderButton({
  product,
  className,
  size = "lg",
}: OrderButtonProps) {
  const url = buildWhatsAppUrl(buildProductOrderMessage(product));
  const disabled = !product.isAvailable || product.badge === "sold-out";

  if (disabled) {
    return (
      <Button disabled size={size} className={className}>
        Stok Habis
      </Button>
    );
  }

  return (
    <Button asChild size={size} className={className}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() =>
          track(AnalyticsEvent.CLICK_WA_PRODUCT, {
            product_id: product.id,
            product_slug: product.slug,
            product_name: product.name,
            price: product.price,
            category: product.category,
            source: "pdp_inline",
          })
        }
      >
        <MessageCircle className="h-4 w-4" />
        Order via WhatsApp
      </a>
    </Button>
  );
}
