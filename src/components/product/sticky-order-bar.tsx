"use client";

import { MessageCircle } from "lucide-react";
import { AnalyticsEvent, track } from "@/lib/analytics";
import { logInquiry } from "@/lib/log-inquiry";
import {
  buildProductOrderMessage,
  buildWhatsAppUrl,
} from "@/lib/whatsapp";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types";

/**
 * Sticky order bar — mobile only.
 * Selalu tampil di bawah viewport agar CTA order tidak hilang saat scroll.
 * Desktop: CTA inline di detail sudah cukup.
 */
export function StickyOrderBar({ product }: { product: Product }) {
  const disabled = !product.isAvailable || product.badge === "sold-out";
  const url = buildWhatsAppUrl(buildProductOrderMessage(product));

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/50 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_-12px_rgba(52,20,30,0.18)] backdrop-blur-md md:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex max-w-lg items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold tracking-tight">
            {product.name}
          </p>
          <p className="text-sm font-medium text-foreground/85">
            {formatCurrency(product.price)}
          </p>
        </div>

        {disabled ? (
          <span className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-secondary px-5 text-sm font-medium text-muted-foreground">
            Stok habis
          </span>
        ) : (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              track(AnalyticsEvent.CLICK_WA_STICKY, {
                product_id: product.id,
                product_slug: product.slug,
                product_name: product.name,
                price: product.price,
                category: product.category,
                source: "pdp_sticky",
              });
              logInquiry({
                source: "pdp_sticky",
                productId: product.id,
                productSlug: product.slug,
                productName: product.name,
                productPrice: product.price,
                meta: { category: product.category },
              });
            }}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-medium tracking-wide text-primary-foreground shadow-sm shadow-primary/25 transition-transform active:scale-[0.98]"
          >
            <MessageCircle className="h-4 w-4" />
            Order WA
          </a>
        )}
      </div>
    </div>
  );
}
