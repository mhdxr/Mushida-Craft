import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { listInquiries } from "@/lib/inquiry-api";

/**
 * GET /api/admin/inquiries — daftar lead WA (admin only).
 */
export async function GET(req: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized. Silakan login terlebih dahulu." },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const limitRaw = Number(searchParams.get("limit") || "100");
    const limit = Number.isFinite(limitRaw)
      ? Math.min(Math.max(limitRaw, 1), 200)
      : 100;

    const inquiries = await listInquiries(limit);
    return NextResponse.json({ ok: true, inquiries });
  } catch (err) {
    console.error("Gagal mengambil inquiries:", err);
    return NextResponse.json(
      {
        ok: false,
        message:
          err instanceof Error && /relation|inquiries/i.test(err.message)
            ? "Tabel inquiries belum ada. Jalankan migrasi 0005_inquiries.sql."
            : "Terjadi kesalahan pada server.",
      },
      { status: 500 },
    );
  }
}
