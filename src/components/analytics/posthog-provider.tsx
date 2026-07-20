"use client";

import { Suspense, useEffect } from "react";
import posthog from "posthog-js";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * PostHog Analytics Provider.
 *
 * Event & asset diarahkan ke reverse-proxy same-origin `/ingest`
 * (lihat rewrites di next.config.mjs) agar:
 * - lolos CSP tanpa allowlist host PostHog eksternal
 * - tidak mudah diblokir ad-blocker
 *
 * ui_host tetap ke dashboard PostHog (untuk toolbar / link).
 *
 * Pageview di-track manual (App Router). useSearchParams dibungkus Suspense
 * agar tidak membatalkan SSG.
 */
function PostHogPageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
    if (typeof posthog?.capture !== "function") return;
    try {
      const url =
        pathname +
        (searchParams?.toString() ? `?${searchParams.toString()}` : "");
      posthog.capture("$pageview", { $current_url: url });
    } catch {
      // Analytics tidak boleh merusak UI.
    }
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;

    try {
      // Region UI: US default. Set NEXT_PUBLIC_POSTHOG_UI_HOST=https://eu.posthog.com bila EU.
      const uiHost =
        process.env.NEXT_PUBLIC_POSTHOG_UI_HOST || "https://us.posthog.com";

      posthog.init(key, {
        // Same-origin reverse proxy (next.config rewrites → us.i / us-assets).
        api_host: "/ingest",
        ui_host: uiHost,
        autocapture: true,
        capture_pageview: false,
        // Session replay assets ikut lewat /ingest/static → us-assets (lolos CSP).
        disable_session_recording: false,
        session_recording: {
          maskAllInputs: true,
          maskTextSelector: "*",
        },
        persistence: "localStorage+cookie",
        loaded: (ph) => {
          if (process.env.NODE_ENV === "development") ph.debug();
        },
      });
    } catch {
      // Abaikan kegagalan init analytics agar UI tetap interaktif.
    }
  }, []);

  return (
    <>
      {children}
      <Suspense fallback={null}>
        <PostHogPageViewTracker />
      </Suspense>
    </>
  );
}
