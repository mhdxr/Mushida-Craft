import type { Product, ProductBadge, ProductCategory } from "@/types";

/**
 * Product storage — Supabase backend.
 *
 * Sebelumnya menggunakan localStorage; sekarang dipindahkan ke Supabase
 * untuk persistensi yang konsisten antara server & client.
 *
 * Dua lapis akses:
 * - Repository (client reads): pakai anon key (browser) — hanya SELECT.
 * - API functions (admin writes): pakai service role key (server) — bypass RLS.
 *
 * Login admin TIDAK pakai Supabase Auth; tetap env credentials + cookie sesi.
 */

// ---------------------------------------------------------------------------
// Mapping antara Product (camelCase) dan baris database (snake_case)
// ---------------------------------------------------------------------------

interface ProductRow {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  images: string[];
  badge: ProductBadge | null;
  is_available: boolean;
  created_at: string;
}

export function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    price: row.price,
    category: row.category,
    images: row.images ?? [],
    badge: row.badge ?? undefined,
    isAvailable: row.is_available,
    createdAt:
      typeof row.created_at === "string"
        ? row.created_at.slice(0, 10)
        : new Date(row.created_at).toISOString().slice(0, 10),
  };
}

export function productToRow(
  product: Omit<ProductRow, "created_at">,
): Omit<ProductRow, "created_at"> {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category,
    images: product.images,
    badge: product.badge ?? null,
    is_available: product.is_available,
  };
}

// ---------------------------------------------------------------------------
// Helper: ambil semua produk (public, anon key — RLS SELECT)
// Dipakai oleh catalog-view, product-detail-content, dan server components.
// ---------------------------------------------------------------------------

export interface ProductRepository {
  list(): Promise<Product[]>;
  getById(id: string): Promise<Product | undefined>;
  getBySlug(slug: string): Promise<Product | undefined>;
  getFeatured(limit?: number): Promise<Product[]>;
  getRelated(product: Product, limit?: number): Promise<Product[]>;
}

// ---------------------------------------------------------------------------
// Pure helper (tidak butuh DB)
// ---------------------------------------------------------------------------

/**
 * Ambil produk terkait berdasarkan kategori dari list yang sudah di-load.
 */
export function findRelatedProducts(
  product: Product,
  source: Product[],
  limit = 4,
): Product[] {
  return source
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, limit);
}
