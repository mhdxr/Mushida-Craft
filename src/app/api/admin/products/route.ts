import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  fetchProducts,
  fetchProductBySlug,
  createProduct,
  resetProducts,
} from "@/lib/product-api";
import { products as seedProducts } from "@/data/products";
import { revalidateStorefront } from "@/lib/revalidate-storefront";
import { productSchema } from "@/lib/validations";
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
      try {
        const product = await fetchProductBySlug(slug);
        if (!product) {
          // Fallback seed by slug agar detail publik tidak 500.
          const seed = seedProducts.find((p) => p.slug === slug) ?? null;
          if (!seed) {
            return NextResponse.json(
              { ok: false, message: "Produk tidak ditemukan." },
              { status: 404 },
            );
          }
          return NextResponse.json({ ok: true, product: seed });
        }
        return NextResponse.json({ ok: true, product });
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
      // Supabase down / misconfig → seed agar katalog admin & client tidak hang.
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

/**
 * POST /api/admin/products
 *   Buat produk baru (admin only).
 *   Special: body { action: "reset" } → reset ke seed (hanya non-production).
 */
export async function POST(req: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized. Silakan login terlebih dahulu." },
        { status: 401 },
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { ok: false, message: "Data produk tidak valid." },
        { status: 400 },
      );
    }

    // Reset ke seed — diblokir di production agar tidak wipe katalog live.
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

    // Create produk baru
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
      {
        ok: false,
        message:
          err instanceof Error && err.message
            ? err.message
            : "Terjadi kesalahan pada server.",
      },
      { status: 500 },
    );
  }
}
