"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { track, type AnalyticsEventName } from "@/lib/analytics";
import {
  logInquiry,
  type LogInquiryInput,
} from "@/lib/log-inquiry";

type Props = {
  href: string;
  event: AnalyticsEventName | string;
  eventProps?: Record<string, string | number | boolean | null | undefined>;
  /** Opsional: catat lead WA ke pipeline admin (fire-and-forget). */
  inquiry?: LogInquiryInput;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<"a">, "href" | "children" | "className">;

/**
 * Link eksternal WhatsApp yang menembak event analytics saat diklik.
 * Opsional log inquiry ke admin pipeline.
 * Aman dipakai dari Server Component (client boundary di sini).
 */
export function TrackedWhatsAppLink({
  href,
  event,
  eventProps,
  inquiry,
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
        if (inquiry) logInquiry(inquiry);
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
