import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Admin session management — cookie-based (HTTP-only).
 *
 * Sebelumnya pakai localStorage (client-only). Sekarang server juga perlu
 * memverifikasi sesi admin (untuk API routes product CRUD), jadi migrasi
 * ke HTTP-only cookie yang bisa dibaca server-side.
 *
 * Login admin tetap memakai env credentials (ADMIN_EMAIL / ADMIN_PASSWORD),
 * BUKAN Supabase Auth.
 *
 * Catatan Next 16: cookies() sekarang async — harus di-await.
 */

const SESSION_COOKIE = "Mushida:admin-session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 hari (detik)

export interface AdminSession {
  email: string;
  loggedAt: number;
}

function createSessionToken(session: AdminSession): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET belum diset.");

  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const signature = createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

// ---------------------------------------------------------------------------
// Server-side (API routes, server components) — pakai next/headers cookies()
// ---------------------------------------------------------------------------

/** Baca sesi admin dari cookie (server-side). */
export async function getAdminSessionFromCookie(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  try {
    const secret = process.env.SESSION_SECRET;
    if (!secret) return null;

    const parts = raw.split(".");
    if (parts.length !== 2) return null;

    const [payload, encodedSignature] = parts;
    if (
      !payload ||
      !encodedSignature ||
      !/^[A-Za-z0-9_-]+$/.test(payload) ||
      !/^[A-Za-z0-9_-]+$/.test(encodedSignature)
    ) {
      return null;
    }

    const signature = Buffer.from(encodedSignature, "base64url");
    const expectedSignature = createHmac("sha256", secret)
      .update(payload)
      .digest();
    if (
      signature.length !== expectedSignature.length ||
      !timingSafeEqual(signature, expectedSignature)
    ) {
      return null;
    }

    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as unknown;
    if (
      typeof session !== "object" ||
      session === null ||
      typeof (session as AdminSession).email !== "string" ||
      !(session as AdminSession).email ||
      typeof (session as AdminSession).loggedAt !== "number" ||
      !Number.isFinite((session as AdminSession).loggedAt)
    ) {
      return null;
    }

    const adminSession = session as AdminSession;
    const ageSeconds = (Date.now() - adminSession.loggedAt) / 1000;
    if (ageSeconds < 0 || ageSeconds > SESSION_MAX_AGE) return null;

    return adminSession;
  } catch {
    return null;
  }
}

/** Cek apakah request saat ini berasal dari admin yang login. */
export async function isAdminAuthenticated(): Promise<boolean> {
  return (await getAdminSessionFromCookie()) !== null;
}

/** Set cookie sesi admin (dipanggil dari API route login). */
export async function setAdminSessionCookie(email: string) {
  const cookieStore = await cookies();
  const session: AdminSession = { email, loggedAt: Date.now() };
  cookieStore.set({
    name: SESSION_COOKIE,
    value: createSessionToken(session),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

/** Hapus cookie sesi admin (dipanggil dari API route logout). */
export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

// ---------------------------------------------------------------------------
// Client-side helper — untuk redirect di admin dashboard.
// Cookie HTTP-only tidak bisa dibaca JS, jadi cek via API / flag terpisah.
// ---------------------------------------------------------------------------

/**
 * Client-side: cek status login admin dengan memanggil API.
 * Dipakai di admin dashboard untuk guard redirect.
 */
export async function checkAdminAuthClient(): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/session", { cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}
