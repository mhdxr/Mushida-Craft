import { NextResponse } from "next/server";
import { guardAdminRequest } from "@/lib/admin-guard";
import { createProduct, resetProducts } from "@/lib/product-api";
import { products as seedProducts } from "@/data/products";
import { revalidateStorefront } from "@/lib/revalidate-storefront";
import { productSchema } from "@/lib/validations";
import { GET as publicProductsGet } from "@/app/api/products/route";
import type { Product } from "@/types";

/**
 * GET /api/admin/products — alias baca (deprecated).
 * Prefer GET /api/products. Delegasi penuh agar tidak ada logika ganda.
 */
export const GET = publicProductsGet;

/**
 * POST /api/admin/products — create / reset seed (admin only).
 * Reset diblokir di production.
 */
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

    if (
      typeof body === "object" &&
      body !== null &&
      (body as { action?: unknown }).action === "reset"
    ) {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          {
            ok: false,
            message:
              "Reset seed dinonaktifkan di production. Gunakan di development saja.",
          },
          { status: 403 },
        );
      }
      await resetProducts(seedProducts as Product[]);
      revalidateStorefront();
      return NextResponse.json({ ok: true, message: "Data direset ke seed." });
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
