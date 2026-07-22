import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  countNewInquiries,
  listInquiries,
  type InquiryStatus,
} from "@/lib/inquiry-api";

/**
 * GET /api/admin/inquiries — daftar lead WA (admin only).
 * Query:
 *   ?limit=100
 *   ?status=new|contacted|archived|all  (default all)
 *   ?count=new  → { ok, count } saja (untuk badge nav)
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

    if (searchParams.get("count") === "new") {
      try {
        const count = await countNewInquiries();
        return NextResponse.json({ ok: true, count });
      } catch (err) {
        // Migrasi status belum ada → anggap 0, jangan rusak shell.
        console.error("Gagal hitung inquiry baru:", err);
        return NextResponse.json({ ok: true, count: 0 });
      }
    }

    const limitRaw = Number(searchParams.get("limit") || "100");
    const limit = Number.isFinite(limitRaw)
      ? Math.min(Math.max(limitRaw, 1), 200)
      : 100;

    const statusRaw = searchParams.get("status") || "all";
    const status =
      statusRaw === "new" ||
      statusRaw === "contacted" ||
      statusRaw === "archived" ||
      statusRaw === "all"
        ? (statusRaw as InquiryStatus | "all")
        : "all";

    const inquiries = await listInquiries(limit, status);
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
