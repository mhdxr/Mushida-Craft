import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { updateProduct, deleteProduct } from "@/lib/product-api";
import { productSchema } from "@/lib/validations";

const productPatchSchema = productSchema
  .partial()
  .refine((input) => Object.keys(input).length > 0);

/**
 * GET /api/admin/products/[id] — ambil satu produk by id (public).
 * (Saat ini tidak dipakai — list sudah cukup, tapi disediakan untuk masa depan.)
 */

/**
 * PATCH /api/admin/products/[id] — update produk (admin only).
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized. Silakan login terlebih dahulu." },
        { status: 401 },
      );
    }

    const { id } = await params;
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { ok: false, message: "Data produk tidak valid." },
        { status: 400 },
      );
    }

    const result = productPatchSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { ok: false, message: "Data produk tidak valid." },
        { status: 400 },
      );
    }

    const product = await updateProduct(id, result.data);

    if (!product) {
      return NextResponse.json(
        { ok: false, message: "Produk tidak ditemukan." },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true, product });
  } catch (err) {
    console.error("Gagal memperbarui produk:", err);
    return NextResponse.json(
      { ok: false, message: "Terjadi kesalahan pada server." },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/admin/products/[id] — hapus produk (admin only).
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized. Silakan login terlebih dahulu." },
        { status: 401 },
      );
    }

    const { id } = await params;
    await deleteProduct(id);
    return NextResponse.json({ ok: true, message: "Produk dihapus." });
  } catch (err) {
    console.error("Gagal menghapus produk:", err);
    return NextResponse.json(
      { ok: false, message: "Terjadi kesalahan pada server." },
      { status: 500 },
    );
  }
}
