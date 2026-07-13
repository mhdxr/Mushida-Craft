import { NextResponse } from "next/server";

/**
 * PostHog ingest proxy.
 *
 * Meneruskan events dari browser ke PostHog API. Berguna untuk mengatasi
 * ad-blocker yang memblokir request langsung ke us.i.posthog.com.
 *
 * PostHog SDK di client diarahkan ke route ini via api_host + /ingest.
 */
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

async function proxyRequest(req: Request, path: string) {
  const url = `${POSTHOG_HOST}${path}`;
  const body = await req.text();

  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.set("content-type", "application/json");

  const res = await fetch(url, {
    method: req.method,
    headers,
    body: body || undefined,
  });

  const data = await res.text();
  return new NextResponse(data, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") || "application/json",
    },
  });
}

/** POST /api/posthog/ingest — proxy batch events ke PostHog */
export async function POST(req: Request) {
  try {
    return await proxyRequest(req, "/batch/");
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

/** GET /api/posthog/ingest/* — proxy decisions/feature flags */
export async function GET(req: Request) {
  try {
    const { pathname } = new URL(req.url);
    // pathname = /api/posthog/ingest/... → strip prefix
    const path = pathname.replace("/api/posthog/ingest", "");
    return await proxyRequest(req, path);
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
