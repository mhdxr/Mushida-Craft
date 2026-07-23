import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  verifySessionToken,
  type AdminSession,
} from "@/lib/session-token";

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
 * Logika token murni ada di session-token.ts (bisa dipakai middleware Edge).
 *
 * Catatan Next 16: cookies() sekarang async — harus di-await.
 */

export type { AdminSession };
export { SESSION_COOKIE, SESSION_MAX_AGE };

// ---------------------------------------------------------------------------
// Server-side (API routes, server components) — pakai next/headers cookies()
// ---------------------------------------------------------------------------

/** Baca sesi admin dari cookie (server-side). */
export async function getAdminSessionFromCookie(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;

  return verifySessionToken(raw, secret, SESSION_MAX_AGE);
}

/** Cek apakah request saat ini berasal dari admin yang login. */
export async function isAdminAuthenticated(): Promise<boolean> {
  return (await getAdminSessionFromCookie()) !== null;
}

/** Set cookie sesi admin (dipanggil dari API route login). */
export async function setAdminSessionCookie(email: string) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET belum diset.");

  const cookieStore = await cookies();
  const session: AdminSession = { email, loggedAt: Date.now() };
  cookieStore.set({
    name: SESSION_COOKIE,
    value: await createSessionToken(session, secret),
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
  // Mirror atribut saat set (path/secure/sameSite) + maxAge 0 agar benar-benar
  // terhapus di semua runtime; delete-by-name saja bisa gagal bila atribut beda.
  cookieStore.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
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
