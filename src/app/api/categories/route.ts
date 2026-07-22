import { NextResponse } from "next/server";
import { fetchCategories } from "@/lib/category-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/categories — public list kategori aktif.
 * Fallback seed di layer API bila DB kosong/gagal.
 */
export async function GET() {
  try {
    const categories = await fetchCategories({ includeInactive: false });
    return NextResponse.json(
      { ok: true, categories },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      },
    );
  } catch (err) {
    console.error("Gagal mengambil kategori:", err);
    return NextResponse.json(
      { ok: false, message: "Terjadi kesalahan pada server.", categories: [] },
      { status: 500 },
    );
  }
}
