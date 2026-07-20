"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { getTimeGreeting } from "@/lib/greeting";

/** Sapaan waktu — client-only agar SSR/client markup identik di first paint. */
export function HeroGreeting() {
  const [greeting, setGreeting] = useState("Halo");

  useEffect(() => {
    setGreeting(getTimeGreeting());
  }, []);

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/70 px-4 py-1.5 text-xs font-medium text-primary backdrop-blur-sm">
      <Sparkles className="h-3.5 w-3.5" />
      {greeting} · Mushida Craft
    </div>
  );
}
