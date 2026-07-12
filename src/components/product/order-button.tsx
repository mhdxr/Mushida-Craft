"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <a href={url} target="_blank" rel="noopener noreferrer">
        <MessageCircle className="h-4 w-4" />
        Order via WhatsApp
      </a>
    </Button>
  );
}
