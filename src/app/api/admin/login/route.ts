import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { setAdminSessionCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";

const MAX_FAILED_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

interface LoginAttempts {
  count: number;
  expiresAt: number;
}

// Map ini lokal per proses. Gunakan store eksternal seperti Upstash Redis
// agar rate limit konsisten pada deployment multi-instance.
const failedLoginAttempts = new Map<string, LoginAttempts>();

function getClientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

function isRateLimited(ip: string): boolean {
  const attempts = failedLoginAttempts.get(ip);
  if (!attempts) return false;

  if (attempts.expiresAt <= Date.now()) {
    failedLoginAttempts.delete(ip);
    return false;
  }

  return attempts.count >= MAX_FAILED_ATTEMPTS;
}

function recordFailedAttempt(ip: string) {
  const now = Date.now();
  const attempts = failedLoginAttempts.get(ip);

  if (!attempts || attempts.expiresAt <= now) {
    failedLoginAttempts.set(ip, {
      count: 1,
      expiresAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return;
  }

  attempts.count += 1;
}

function safeEqual(value: string, expected: string): boolean {
  const valueHash = createHash("sha256").update(value).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  return timingSafeEqual(valueHash, expectedHash);
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, message: "Terlalu banyak percobaan. Coba lagi nanti." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    recordFailedAttempt(ip);
    return NextResponse.json(
      { ok: false, message: "Data login tidak valid." },
      { status: 400 },
    );
  }

  const result = loginSchema.safeParse(body);
  if (!result.success) {
    recordFailedAttempt(ip);
    return NextResponse.json(
      { ok: false, message: "Data login tidak valid." },
      { status: 400 },
    );
  }

  try {
    const { email, password } = result.data;
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error("Kredensial admin belum dikonfigurasi.");
      return NextResponse.json(
        { ok: false, message: "Terjadi kesalahan pada server." },
        { status: 500 },
      );
    }

    const emailMatches = safeEqual(email, adminEmail);
    const passwordMatches = safeEqual(password, adminPassword);
    if (!emailMatches || !passwordMatches) {
      recordFailedAttempt(ip);
      return NextResponse.json(
        { ok: false, message: "Email atau password salah." },
        { status: 401 },
      );
    }

    // Set HTTP-only cookie sesi admin (bukan localStorage lagi).
    await setAdminSessionCookie(email);
    failedLoginAttempts.delete(ip);

    return NextResponse.json({ ok: true, email });
  } catch (err) {
    console.error("Gagal memproses login admin:", err);
    return NextResponse.json(
      { ok: false, message: "Terjadi kesalahan pada server." },
      { status: 500 },
    );
  }
}
