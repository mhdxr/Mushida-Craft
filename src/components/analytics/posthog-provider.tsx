"use client";

import { Suspense, useEffect } from "react";
import posthog from "posthog-js";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * PostHog Analytics Provider.
 *
 * Auto-capture: pageviews, clicks, input changes, session replay.
 * No-op jika NEXT_PUBLIC_POSTHOG_KEY kosong (aman untuk dev/CI).
 *
 * Pageview tracking dilakukan manual di sini (lebih reliable di App Router
 * daripada autocapture bawaan yang bisa miss saat route change).
 *
 * Catatan: useSearchParams harus dibungkus Suspense agar tidak membatalkan
 * SSG prerender untuk halaman static (Next.js 16 requirement).
 */
function PostHogPageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track pageview saat route berubah.
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  // Init PostHog sekali saat mount.
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return; // no-op jika key kosong

    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      autocapture: true,
      capture_pageview: false, // kita track manual di PostHogPageViewTracker
      disable_session_recording: false,
      persistence: "localStorage+cookie",
      loaded: (ph) => {
        if (process.env.NODE_ENV === "development") ph.debug();
      },
    });
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
