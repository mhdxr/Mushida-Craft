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

// ---------------------------------------------------------------------------
// Server-side (API routes, server components) — pakai next/headers cookies()
// ---------------------------------------------------------------------------

/** Baca sesi admin dari cookie (server-side). */
export async function getAdminSessionFromCookie(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminSession;
  } catch {
    return null;
  }
}

/** Cek apakah request saat ini berasal dari admin yang login. */
export async function isAdminAuthenticated(): Promise<boolean> {
  const session = await getAdminSessionFromCookie();
  if (!session) return false;
  // Cek kedaluwarsa
  const ageSeconds = (Date.now() - session.loggedAt) / 1000;
  return ageSeconds <= SESSION_MAX_AGE;
}

/** Set cookie sesi admin (dipanggil dari API route login). */
export async function setAdminSessionCookie(email: string) {
  const cookieStore = await cookies();
  const session: AdminSession = { email, loggedAt: Date.now() };
  cookieStore.set({
    name: SESSION_COOKIE,
    value: JSON.stringify(session),
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
