/**
 * Thin analytics wrapper di atas PostHog.
 * No-op aman bila PostHog belum init / key kosong / SSR.
 * Hanya dipanggil dari Client Components.
 */

import posthog from "posthog-js";

type AnalyticsProps = Record<string, string | number | boolean | null | undefined>;

/** Nama event funnel — string stabil agar dashboard PostHog tidak pecah. */
export const AnalyticsEvent = {
  VIEW_ITEM: "view_item",
  CLICK_WA_PRODUCT: "click_wa_product",
  CLICK_WA_STICKY: "click_wa_sticky",
  CLICK_WA_FAB: "click_wa_fab",
  CLICK_WA_FOOTER: "click_wa_footer",
  CLICK_WA_DELIVERY: "click_wa_delivery",
  SUBMIT_CUSTOM_ORDER: "submit_custom_order",
  SUBMIT_TESTIMONIAL: "submit_testimonial",
} as const;

export type AnalyticsEventName =
  (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent];

function scrub(props?: AnalyticsProps): Record<string, string | number | boolean> {
  if (!props) return {};
  const out: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null) continue;
    out[key] = value;
  }
  return out;
}

/** Capture event; gagal diam-diam agar UI tidak rusak. */
export function track(
  event: AnalyticsEventName | string,
  props?: AnalyticsProps,
): void {
  if (typeof window === "undefined") return;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;

  try {
    if (typeof posthog?.capture !== "function") return;
    posthog.capture(event, scrub(props));
  } catch {
    // Analytics tidak boleh merusak UI.
  }
}
