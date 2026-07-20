"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import {
  buildDefaultInquiryMessage,
  buildWhatsAppUrl,
} from "@/lib/whatsapp";

export function WhatsAppFab() {
  const url = buildWhatsAppUrl(buildDefaultInquiryMessage());
  const reduceMotion = useReducedMotion();

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat WhatsApp Mushida"
      // Tombol WA harus langsung terlihat — jangan delay + opacity 0.
      initial={reduceMotion ? false : { opacity: 1, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-emerald-500/30 transition-shadow hover:shadow-xl hover:shadow-emerald-500/40 md:bottom-6 md:right-6"
    >
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-30" />
      <MessageCircle className="relative h-6 w-6" />
      <span className="sr-only">Chat WhatsApp</span>
    </motion.a>
  );
}
