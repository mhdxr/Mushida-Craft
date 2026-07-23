import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";

/**
 * Guard untuk mutasi admin (POST/PATCH/DELETE).
 *
 * Dua lapis:
 * 1. Origin/Referer harus cocok host situs — mitigasi CSRF (lengkapi SameSite=Lax).
 * 2. Sesi admin valid (cookie HMAC).
 *
 * Klien non-browser sering tidak mengirim Origin/Referer; dalam hal itu kita
 * andalkan cookie SameSite + auth. Jika header ADA tapi host beda → tolak 403.
 */
export function isTrustedOrigin(req: Request): boolean {
  const source = req.headers.get("origin") ?? req.headers.get("referer");
  if (!source) return true;

  try {
    const url = new URL(source);
    const host =
      req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
    return url.host === host;
  } catch {
    return false;
  }
}

/**
 * Return NextResponse bila permintaan ditolak (403 origin / 401 auth),
 * atau null bila lolos — pola: `const denied = await guardAdminRequest(req); if (denied) return denied;`
 */
export async function guardAdminRequest(
  req: Request,
): Promise<NextResponse | null> {
  if (!isTrustedOrigin(req)) {
    return NextResponse.json(
      { ok: false, message: "Permintaan ditolak: origin tidak dikenali." },
      { status: 403 },
    );
  }

  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized. Silakan login terlebih dahulu." },
      { status: 401 },
    );
  }

  return null;
}
