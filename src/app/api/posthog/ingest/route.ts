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
const INGEST_PREFIX = "/api/posthog/ingest";

/**
 * Allowlist path PostHog yang boleh di-proxy. Tanpa ini route berfungsi
 * sebagai open proxy (SSRF / penyalahgunaan kuota). Hanya endpoint ingest
 * & feature-flag/asset resmi PostHog yang diizinkan.
 */
const ALLOWED_GET_PREFIXES = [
  "/decide/",
  "/flags/",
  "/array/",
  "/static/",
  "/e/",
  "/s/",
];

function isAllowedGetPath(path: string): boolean {
  return ALLOWED_GET_PREFIXES.some((prefix) => path.startsWith(prefix));
}

async function proxyRequest(req: Request, path: string) {
  const url = `${POSTHOG_HOST}${path}`;
  const body = await req.text();

  const headers = new Headers();
  headers.set(
    "content-type",
    req.headers.get("content-type") || "application/json",
  );
  const userAgent = req.headers.get("user-agent");
  if (userAgent) headers.set("user-agent", userAgent);

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
  } catch (err) {
    console.error("Gagal meneruskan event PostHog:", err);
    return NextResponse.json(
      { ok: false, message: "Terjadi kesalahan pada server." },
      { status: 500 },
    );
  }
}

/** GET /api/posthog/ingest/* — proxy decisions/feature flags */
export async function GET(req: Request) {
  try {
    const { pathname } = new URL(req.url);
    // pathname = /api/posthog/ingest/... → strip prefix
    const path = pathname.startsWith(INGEST_PREFIX)
      ? pathname.slice(INGEST_PREFIX.length)
      : "";
    if (!path.startsWith("/") || path.startsWith("//")) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    if (!isAllowedGetPath(path)) {
      return NextResponse.json({ ok: false }, { status: 403 });
    }
    return await proxyRequest(req, path);
  } catch (err) {
    console.error("Gagal meneruskan request PostHog:", err);
    return NextResponse.json(
      { ok: false, message: "Terjadi kesalahan pada server." },
      { status: 500 },
    );
  }
}
