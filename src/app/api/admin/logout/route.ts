import { NextResponse } from "next/server";
import { clearAdminSessionCookie } from "@/lib/auth";

/** POST /api/admin/logout — hapus sesi admin. */
export async function POST() {
  await clearAdminSessionCookie();
  return NextResponse.json({ ok: true });
}
