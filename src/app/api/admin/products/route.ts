import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  fetchProducts,
  fetchProductBySlug,
  createProduct,
  resetProducts,
} from "@/lib/product-api";
import { products as seedProducts } from "@/data/products";
import type { Product } from "@/types";

/**
 * GET /api/admin/products
 *   ?slug=xxx  → ambil satu produk by slug (public, tidak butuh auth)
 *   (tanpa query) → list semua produk (public, tidak butuh auth)
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (slug) {
      const product = await fetchProductBySlug(slug);
      if (!product) {
        return NextResponse.json(
          { ok: false, message: "Produk tidak ditemukan." },
          { status: 404 },
        );
      }
      return NextResponse.json({ ok: true, product });
    }

    const products = await fetchProducts();
    return NextResponse.json({ ok: true, products });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Gagal mengambil data produk.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

/**
 * POST /api/admin/products
 *   Buat produk baru (admin only).
 *   Body: Omit<Product, "id" | "createdAt">
 *
 * Special: body { action: "reset" } → reset ke seed (admin only).
 */
export async function POST(req: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized. Silakan login terlebih dahulu." },
        { status: 401 },
      );
    }

    const body = (await req.json()) as Record<string, unknown>;

    // Reset ke seed
    if (body.action === "reset") {
      await resetProducts(seedProducts as Product[]);
      return NextResponse.json({ ok: true, message: "Data direset ke seed." });
    }

    // Create produk baru
    const input = body as Omit<Product, "id" | "createdAt">;
    if (
      !input.name ||
      !input.description ||
      typeof input.price !== "number" ||
      !input.category ||
      !Array.isArray(input.images)
    ) {
      return NextResponse.json(
        { ok: false, message: "Data produk tidak lengkap." },
        { status: 400 },
      );
    }

    const product = await createProduct(input);
    return NextResponse.json({ ok: true, product }, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Gagal membuat produk.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
