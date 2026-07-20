import { MessageCircle } from "lucide-react";
import {
  buildDefaultInquiryMessage,
  buildWhatsAppUrl,
} from "@/lib/whatsapp";

/** FAB WhatsApp statis — tanpa Framer agar selalu klikable. */
export function WhatsAppFab() {
  const url = buildWhatsAppUrl(buildDefaultInquiryMessage());

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat WhatsApp Mushida"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-emerald-500/30 transition-transform hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/40 active:scale-95 md:bottom-6 md:right-6"
    >
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-30" />
      <MessageCircle className="relative h-6 w-6" />
      <span className="sr-only">Chat WhatsApp</span>
    </a>
  );
}
