import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { guardAdminRequest } from "@/lib/admin-guard";
import { updateCategory } from "@/lib/category-api";
import type { ProductCategory } from "@/types";

const bodySchema = z.object({
  name: z.string().min(1).max(40).optional(),
  description: z.string().max(200).optional(),
  icon: z.string().max(16).optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
  isActive: z.boolean().optional(),
});

const ALLOWED = new Set([
  "snack-bouquet",
  "money-bouquet",
  "artificial-bouquet",
  "graduation-bouquet",
  "satin-flower",
]);

/**
 * PATCH /api/admin/categories/[id] — update metadata kategori (admin only).
 * ID slug fixed; tidak bisa rename id / tambah kategori baru lewat API ini.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const denied = await guardAdminRequest(req);
    if (denied) return denied;

    const { id } = await params;
    if (!id || !ALLOWED.has(id)) {
      return NextResponse.json(
        { ok: false, message: "ID kategori tidak dikenali." },
        { status: 400 },
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { ok: false, message: "Body tidak valid." },
        { status: 400 },
      );
    }

    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message: parsed.error.issues[0]?.message || "Data tidak valid.",
        },
        { status: 400 },
      );
    }

    if (Object.keys(parsed.data).length === 0) {
      return NextResponse.json(
        { ok: false, message: "Tidak ada field yang diubah." },
        { status: 400 },
      );
    }

    const category = await updateCategory(id as ProductCategory, parsed.data);
    if (!category) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Kategori tidak ditemukan. Pastikan migrasi 0008_categories.sql sudah dijalankan.",
        },
        { status: 404 },
      );
    }

    try {
      revalidatePath("/");
      revalidatePath("/katalog");
      revalidatePath("/admin/kategori");
    } catch {
      // ignore
    }

    return NextResponse.json({ ok: true, category });
  } catch (err) {
    console.error("Gagal update kategori:", err);
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
