import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  countPendingTestimonials,
  listAllTestimonials,
} from "@/lib/testimonial-api";

/**
 * GET /api/admin/testimonials — daftar semua testimoni (admin only).
 * Query:
 *   ?count=pending → { ok, count } saja (untuk badge nav)
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
    if (searchParams.get("count") === "pending") {
      try {
        const count = await countPendingTestimonials();
        return NextResponse.json({ ok: true, count });
      } catch (err) {
        console.error("Gagal hitung testimoni pending:", err);
        return NextResponse.json({ ok: true, count: 0 });
      }
    }

    const testimonials = await listAllTestimonials();
    return NextResponse.json({ ok: true, testimonials });
  } catch (err) {
    console.error("Gagal mengambil testimoni:", err);
    return NextResponse.json(
      { ok: false, message: "Terjadi kesalahan pada server." },
      { status: 500 },
    );
  }
}
