import { NextResponse } from "next/server";
import { getAdminSessionFromCookie } from "@/lib/auth";

/** GET /api/admin/session — cek apakah admin sedang login. */
export async function GET() {
  const session = await getAdminSessionFromCookie();
  if (!session) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  return NextResponse.json({ ok: true, email: session.email });
}
