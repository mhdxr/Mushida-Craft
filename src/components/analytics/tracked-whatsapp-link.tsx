"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { track, type AnalyticsEventName } from "@/lib/analytics";

type Props = {
  href: string;
  event: AnalyticsEventName | string;
  eventProps?: Record<string, string | number | boolean | null | undefined>;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<"a">, "href" | "children" | "className">;

/**
 * Link eksternal WhatsApp yang menembak event analytics saat diklik.
 * Aman dipakai dari Server Component (client boundary di sini).
 */
export function TrackedWhatsAppLink({
  href,
  event,
  eventProps,
  children,
  className,
  onClick,
  ...rest
}: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={(e) => {
        track(event, eventProps);
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
