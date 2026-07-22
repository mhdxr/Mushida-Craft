import { NextResponse } from "next/server";
import { guardAdminRequest } from "@/lib/admin-guard";
import {
  deleteProduct,
  fetchProductById,
  updateProduct,
} from "@/lib/product-api";
import { revalidateStorefront } from "@/lib/revalidate-storefront";
import { productSchema } from "@/lib/validations";

const productPatchSchema = productSchema
  .partial()
  .refine((input) => Object.keys(input).length > 0);

/**
 * PATCH /api/admin/products/[id] — update produk (admin only).
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const denied = await guardAdminRequest(req);
    if (denied) return denied;

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
      const first = result.error.issues[0]?.message;
      return NextResponse.json(
        { ok: false, message: first || "Data produk tidak valid." },
        { status: 400 },
      );
    }

    // Slug lama untuk revalidate path detail (jika slug diganti).
    const before = await fetchProductById(id);

    const product = await updateProduct(id, result.data);

    if (!product) {
      return NextResponse.json(
        { ok: false, message: "Produk tidak ditemukan." },
        { status: 404 },
      );
    }

    revalidateStorefront(product.slug);
    if (before?.slug && before.slug !== product.slug) {
      revalidateStorefront(before.slug);
    }

    return NextResponse.json({ ok: true, product });
  } catch (err) {
    console.error("Gagal memperbarui produk:", err);
    const msg = err instanceof Error ? err.message : "";
    if (/duplicate|unique|slug/i.test(msg)) {
      return NextResponse.json(
        {
          ok: false,
          message: "Slug produk sudah dipakai. Ubah nama atau slug.",
        },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { ok: false, message: "Terjadi kesalahan pada server." },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/admin/products/[id] — hapus produk (admin only).
 * Juga membersihkan file di Supabase Storage (best-effort).
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const denied = await guardAdminRequest(req);
    if (denied) return denied;

    const { id } = await params;
    const before = await fetchProductById(id);
    const deleted = await deleteProduct(id);
    if (!deleted) {
      return NextResponse.json(
        { ok: false, message: "Produk tidak ditemukan." },
        { status: 404 },
      );
    }
    revalidateStorefront(before?.slug);
    return NextResponse.json({ ok: true, message: "Produk dihapus." });
  } catch (err) {
    console.error("Gagal menghapus produk:", err);
    return NextResponse.json(
      { ok: false, message: "Terjadi kesalahan pada server." },
      { status: 500 },
    );
  }
}
