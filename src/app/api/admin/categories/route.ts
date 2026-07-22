import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { listAllCategories } from "@/lib/category-api";

/**
 * GET /api/admin/categories — semua kategori (termasuk nonaktif), admin only.
 */
export async function GET() {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized. Silakan login terlebih dahulu." },
        { status: 401 },
      );
    }

    const categories = await listAllCategories();
    return NextResponse.json({ ok: true, categories });
  } catch (err) {
    console.error("Gagal mengambil kategori admin:", err);
    return NextResponse.json(
      {
        ok: false,
        message:
          err instanceof Error && /relation|categories/i.test(err.message)
            ? "Tabel categories belum ada. Jalankan migrasi 0008_categories.sql."
            : "Terjadi kesalahan pada server.",
      },
      { status: 500 },
    );
  }
}
