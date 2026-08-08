"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderModal } from "@/components/product/order-modal";
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
  const [modalOpen, setModalOpen] = useState(false);
  const disabled = !product.isAvailable || product.badge === "sold-out";

  if (disabled) {
    return (
      <Button disabled size={size} className={className}>
        Stok habis
      </Button>
    );
  }

  return (
    <>
      <Button size={size} className={className} onClick={() => setModalOpen(true)}>
        <MessageCircle className="h-4 w-4" />
        Order via WhatsApp
      </Button>
      <OrderModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        product={product}
        inquirySource="pdp_inline"
      />
    </>
  );
}
