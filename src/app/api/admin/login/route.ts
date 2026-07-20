import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { setAdminSessionCookie } from "@/lib/auth";
import {
  clearLoginFailures,
  isLoginRateLimited,
  recordLoginFailure,
} from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validations";

function getClientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

function safeEqual(value: string, expected: string): boolean {
  const valueHash = createHash("sha256").update(value).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  return timingSafeEqual(valueHash, expectedHash);
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (await isLoginRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, message: "Terlalu banyak percobaan. Coba lagi nanti." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    await recordLoginFailure(ip);
    return NextResponse.json(
      { ok: false, message: "Data login tidak valid." },
      { status: 400 },
    );
  }

  const result = loginSchema.safeParse(body);
  if (!result.success) {
    await recordLoginFailure(ip);
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
      await recordLoginFailure(ip);
      return NextResponse.json(
        { ok: false, message: "Email atau password salah." },
        { status: 401 },
      );
    }

    // Set HTTP-only cookie sesi admin (bukan localStorage lagi).
    await setAdminSessionCookie(email);
    await clearLoginFailures(ip);

    return NextResponse.json({ ok: true, email });
  } catch (err) {
    console.error("Gagal memproses login admin:", err);
    return NextResponse.json(
      { ok: false, message: "Terjadi kesalahan pada server." },
      { status: 500 },
    );
  }
}
