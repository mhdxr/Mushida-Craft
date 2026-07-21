import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  verifySessionToken,
} from "@/lib/session-token";

/**
 * Middleware proteksi rute /admin/* .
 *
 * - /admin/login: publik; jika sudah login → redirect ke dashboard
 * - rute admin lain: wajib cookie sesi HMAC valid
 *
 * Operasi tulis tetap dilindungi lagi di API routes via isAdminAuthenticated().
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isLogin =
    pathname === "/admin/login" || pathname.startsWith("/admin/login/");

  const raw = req.cookies.get(SESSION_COOKIE)?.value;
  const secret = process.env.SESSION_SECRET;
  const session =
    raw && secret
      ? await verifySessionToken(raw, secret, SESSION_MAX_AGE)
      : null;

  if (isLogin) {
    if (session) {
      const dash = req.nextUrl.clone();
      dash.pathname = "/admin";
      dash.search = "";
      return NextResponse.redirect(dash);
    }
    return NextResponse.next();
  }

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
  matcher: ["/admin", "/admin/:path*"],
};
