import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { listAllTestimonials } from "@/lib/testimonial-api";

/**
 * GET /api/admin/testimonials — daftar semua testimoni (admin only).
 */
export async function GET() {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized. Silakan login terlebih dahulu." },
        { status: 401 },
      );
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
