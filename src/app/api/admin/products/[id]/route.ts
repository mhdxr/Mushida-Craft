import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { updateProduct, deleteProduct } from "@/lib/product-api";
import type { Product } from "@/types";

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
    const input = (await req.json()) as Partial<Product>;
    const product = await updateProduct(id, input);

    if (!product) {
      return NextResponse.json(
        { ok: false, message: "Produk tidak ditemukan." },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true, product });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Gagal memperbarui produk.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
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
    const message =
      err instanceof Error ? err.message : "Gagal menghapus produk.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
