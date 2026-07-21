"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { getTimeGreeting } from "@/lib/greeting";

/** Sapaan waktu di-set setelah mount agar SSR & client markup identik. */
export function HeroGreeting() {
  const [greeting, setGreeting] = useState("Halo");

  useEffect(() => {
    setGreeting(getTimeGreeting());
  }, []);

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/70 px-4 py-1.5 text-[11px] font-medium tracking-[0.14em] text-primary uppercase backdrop-blur-sm">
      <Sparkles className="h-3.5 w-3.5" />
      {greeting}
      <span className="text-primary/40">·</span>
      <span className="normal-case tracking-normal">Handmade premium</span>
    </div>
  );
}
