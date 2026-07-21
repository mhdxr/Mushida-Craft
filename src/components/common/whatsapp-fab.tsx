"use client";

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { AnalyticsEvent, track } from "@/lib/analytics";
import {
  buildDefaultInquiryMessage,
  buildWhatsAppUrl,
} from "@/lib/whatsapp";

/**
 * FAB WhatsApp global.
 * Disembunyikan di halaman produk: sticky order bar sudah jadi CTA utama di mobile.
 */
export function WhatsAppFab() {
  const pathname = usePathname();
  const onProductPage = pathname?.startsWith("/produk/");

  if (onProductPage) return null;

  const url = buildWhatsAppUrl(buildDefaultInquiryMessage());

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat WhatsApp Mushida Craft"
      onClick={() =>
        track(AnalyticsEvent.CLICK_WA_FAB, {
          source: "fab",
          path: pathname || "/",
        })
      }
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-emerald-500/30 transition-transform hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/40 active:scale-95 md:bottom-6 md:right-6"
    >
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-30" />
      <MessageCircle className="relative h-6 w-6" />
      <span className="sr-only">Chat WhatsApp</span>
    </a>
  );
}
