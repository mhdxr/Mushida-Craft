import { NextResponse } from "next/server";
import { guardAdminRequest } from "@/lib/admin-guard";
import { createProduct } from "@/lib/product-api";
import { revalidateStorefront } from "@/lib/revalidate-storefront";
import { productSchema } from "@/lib/validations";
import { GET as publicProductsGet } from "@/app/api/products/route";

/**
 * GET /api/admin/products — alias baca (deprecated).
 * Prefer GET /api/products. Delegasi penuh agar tidak ada logika ganda.
 */
export const GET = publicProductsGet;

/** POST /api/admin/products — create produk (admin only). */
export async function POST(req: Request) {
  try {
    const denied = await guardAdminRequest(req);
    if (denied) return denied;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { ok: false, message: "Data produk tidak valid." },
        { status: 400 },
      );
    }

    const result = productSchema.safeParse(body);
    if (!result.success) {
      const first = result.error.issues[0]?.message;
      return NextResponse.json(
        { ok: false, message: first || "Data produk tidak valid." },
        { status: 400 },
      );
    }

    try {
      const product = await createProduct(result.data);
      revalidateStorefront(product.slug);
      return NextResponse.json({ ok: true, product }, { status: 201 });
    } catch (err) {
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
      throw err;
    }
  } catch (err) {
    console.error("Gagal membuat produk:", err);
    return NextResponse.json(
      { ok: false, message: "Terjadi kesalahan pada server." },
      { status: 500 },
    );
  }
}
