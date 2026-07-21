/**
 * Client helper: catat inquiry WA tanpa memblokir navigasi ke WhatsApp.
 * Gagal diam-diam (network/DB) — order path tetap jalan.
 */

import type { InquirySource } from "@/lib/inquiry-api";

export type LogInquiryInput = {
  source: InquirySource;
  productId?: string;
  productSlug?: string;
  productName?: string;
  productPrice?: number;
  customerName?: string;
  customerWa?: string;
  notes?: string;
  meta?: Record<string, unknown>;
};

export function logInquiry(input: LogInquiryInput): void {
  if (typeof window === "undefined") return;

  try {
    // Fire-and-forget; jangan await di onClick sebelum buka WA.
    void fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      keepalive: true,
    }).catch(() => {
      // ignore
    });
  } catch {
    // ignore
  }
}
