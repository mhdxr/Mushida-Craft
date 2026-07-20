import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  verifySessionToken,
} from "@/lib/session-token";

/**
 * Middleware proteksi rute /admin/* (kecuali /admin/login).
 *
 * Verifikasi cookie sesi HMAC di Edge runtime SEBELUM halaman ter-render,
 * sehingga shell dashboard tidak bocor ke non-admin.
 *
 * Operasi tulis tetap dilindungi lagi di API routes via isAdminAuthenticated().
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // /admin/login selalu publik.
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
    return NextResponse.next();
  }

  const raw = req.cookies.get(SESSION_COOKIE)?.value;
  const secret = process.env.SESSION_SECRET;

  if (!raw || !secret) {
    return redirectToLogin(req);
  }

  const session = await verifySessionToken(raw, secret, SESSION_MAX_AGE);
  if (!session) {
    return redirectToLogin(req);
  }

  return NextResponse.next();
}

function redirectToLogin(req: NextRequest) {
  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/admin/login";
  loginUrl.search = "";
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Lindungi semua path /admin/* kecuali login (dicek di handler di atas juga).
  matcher: ["/admin", "/admin/:path*"],
};
