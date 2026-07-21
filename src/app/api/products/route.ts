import { NextResponse } from "next/server";
import { fetchProducts, fetchProductBySlug } from "@/lib/product-api";
import { products as seedProducts } from "@/data/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/products — public product reads (bukan path /admin).
 *
 *   ?slug=xxx  → satu produk by slug
 *   (tanpa query) → list semua produk
 *
 * Fallback seed jika Supabase belum siap.
 * Write tetap di /api/admin/products (auth required).
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (slug) {
      try {
        const product = await fetchProductBySlug(slug);
        if (product) {
          return NextResponse.json({ ok: true, product });
        }
        const seed = seedProducts.find((p) => p.slug === slug) ?? null;
        if (!seed) {
          return NextResponse.json(
            { ok: false, message: "Produk tidak ditemukan." },
            { status: 404 },
          );
        }
        return NextResponse.json({ ok: true, product: seed });
      } catch {
        const seed = seedProducts.find((p) => p.slug === slug) ?? null;
        if (!seed) {
          return NextResponse.json(
            { ok: false, message: "Produk tidak ditemukan." },
            { status: 404 },
          );
        }
        return NextResponse.json({ ok: true, product: seed });
      }
    }

    try {
      const products = await fetchProducts();
      return NextResponse.json({ ok: true, products });
    } catch (err) {
      console.error("Gagal fetch Supabase, fallback seed:", err);
      return NextResponse.json({ ok: true, products: seedProducts });
    }
  } catch (err) {
    console.error("Gagal mengambil data produk:", err);
    return NextResponse.json(
      { ok: false, message: "Terjadi kesalahan pada server." },
      { status: 500 },
    );
  }
}
