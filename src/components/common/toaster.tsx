"use client";

import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useToasts } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const iconMap = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const styleMap = {
  success: "bg-emerald-50 text-emerald-800 border-emerald-200",
  error: "bg-rose-50 text-rose-800 border-rose-200",
  info: "bg-secondary text-foreground border-border",
};

export function Toaster() {
  const { items, dismiss } = useToasts();

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-24 right-5 z-50 flex w-[min(360px,calc(100vw-2.5rem))] flex-col gap-2 md:bottom-6 md:right-24"
    >
      {items.map((t) => {
        const Icon = iconMap[t.variant];
        return (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-md backdrop-blur-sm",
              styleMap[t.variant],
            )}
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="flex-1 text-sm leading-snug">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Tutup"
              className="rounded p-1 hover:bg-black/5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
