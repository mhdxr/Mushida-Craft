import { NextResponse } from "next/server";
import {
  hasUpstashEnv,
  isProductionRuntime,
  isRateLimitDegraded,
} from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CheckStatus = "ok" | "missing" | "optional_missing";

function present(key: string): boolean {
  return Boolean(process.env[key]?.trim());
}

function checkRequired(key: string): { key: string; status: CheckStatus } {
  return {
    key,
    status: present(key) ? "ok" : "missing",
  };
}

function checkOptional(key: string): { key: string; status: CheckStatus } {
  return {
    key,
    status: present(key) ? "ok" : "optional_missing",
  };
}

/**
 * GET /api/health — readiness env (tanpa membocorkan secret values).
 *
 * - 200 + status "ok" — required lengkap; di production Upstash juga ada
 * - 200 + status "degraded" — required lengkap tapi rate-limit in-memory di prod
 * - 503 + status "error" — ada required env yang hilang
 */
export async function GET() {
  const required = [
    checkRequired("NEXT_PUBLIC_SUPABASE_URL"),
    checkRequired("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    checkRequired("SUPABASE_SERVICE_ROLE_KEY"),
    checkRequired("ADMIN_EMAIL"),
    checkRequired("ADMIN_PASSWORD"),
    checkRequired("SESSION_SECRET"),
    checkRequired("NEXT_PUBLIC_SITE_URL"),
    checkRequired("NEXT_PUBLIC_WHATSAPP_NUMBER"),
  ];

  const optional = [
    checkOptional("NEXT_PUBLIC_SENTRY_DSN"),
    checkOptional("SENTRY_AUTH_TOKEN"),
    checkOptional("NEXT_PUBLIC_POSTHOG_KEY"),
    checkOptional("UPSTASH_REDIS_REST_URL"),
    checkOptional("UPSTASH_REDIS_REST_TOKEN"),
    checkOptional("NEXT_PUBLIC_SERVICE_CITY"),
    checkOptional("NEXT_PUBLIC_SERVICE_AREAS"),
    checkOptional("RESEND_API_KEY"),
    checkOptional("ADMIN_NOTIFY_EMAIL"),
  ];

  const missingRequired = required
    .filter((c) => c.status === "missing")
    .map((c) => c.key);

  const production = isProductionRuntime();
  const upstash = hasUpstashEnv();
  const rateLimitDegraded = isRateLimitDegraded();

  let status: "ok" | "degraded" | "error" = "ok";
  if (missingRequired.length > 0) status = "error";
  else if (rateLimitDegraded) status = "degraded";

  const body = {
    ok: status === "ok",
    status,
    production,
    timestamp: new Date().toISOString(),
    checks: {
      required: Object.fromEntries(
        required.map((c) => [c.key, c.status === "ok"]),
      ),
      optional: Object.fromEntries(
        optional.map((c) => [c.key, c.status === "ok"]),
      ),
      upstashConfigured: upstash,
      rateLimitMode: upstash ? "upstash" : "memory",
      rateLimitDegraded,
    },
    missingRequired,
    notes: [
      rateLimitDegraded
        ? "Production tanpa Upstash: rate limit login/testimoni/inquiry tidak terdistribusi."
        : null,
      !present("NEXT_PUBLIC_SUPABASE_URL")
        ? "NEXT_PUBLIC_SUPABASE_URL wajib saat build agar next/image allowlist Storage terisi."
        : null,
    ].filter(Boolean),
  };

  return NextResponse.json(body, {
    status: status === "error" ? 503 : 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
