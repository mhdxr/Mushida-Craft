import { getBrowserSupabaseClient, getServerSupabaseClient } from "@/lib/supabase";
import { rowToProduct } from "@/lib/product-store";
import { slugify } from "@/lib/utils";
import type { Product } from "@/types";

const TABLE = "products";

// ---------------------------------------------------------------------------
// Public reads (anon key, browser atau server — RLS SELECT only)
// ---------------------------------------------------------------------------

/** Ambil semua produk (urut created_at desc). */
export async function fetchProducts(): Promise<Product[]> {
  const client = getBrowserSupabaseClient();
  const { data, error } = await client
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(rowToProduct);
}

/** Ambil satu produk by slug. */
export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const client = getBrowserSupabaseClient();
  const { data, error } = await client
    .from(TABLE)
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data ? rowToProduct(data) : null;
}

/** Ambil produk best-seller (untuk homepage featured). */
export async function fetchFeaturedProducts(limit = 4): Promise<Product[]> {
  const client = getBrowserSupabaseClient();
  const { data, error } = await client
    .from(TABLE)
    .select("*")
    .eq("badge", "best-seller")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map(rowToProduct);
}

/** Ambil semua slug produk (untuk generateStaticParams). */
export async function fetchAllSlugs(): Promise<string[]> {
  const client = getBrowserSupabaseClient();
  const { data, error } = await client.from(TABLE).select("slug");

  if (error) throw error;
  return (data ?? []).map((row: { slug: string }) => row.slug);
}

// ---------------------------------------------------------------------------
// Server-side reads (anon key juga bisa; ini untuk Server Components yang
// tidak punya akses window). Pakai browser client factory tapi aman di server
// karena createClient() tidak butuh window.
// ---------------------------------------------------------------------------

export async function fetchProductsServer(): Promise<Product[]> {
  const client = getBrowserSupabaseClient();
  const { data, error } = await client
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(rowToProduct);
}

export async function fetchProductBySlugServer(slug: string): Promise<Product | null> {
  const client = getBrowserSupabaseClient();
  const { data, error } = await client
    .from(TABLE)
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data ? rowToProduct(data) : null;
}

export async function fetchFeaturedProductsServer(limit = 4): Promise<Product[]> {
  const client = getBrowserSupabaseClient();
  const { data, error } = await client
    .from(TABLE)
    .select("*")
    .eq("badge", "best-seller")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map(rowToProduct);
}

// ---------------------------------------------------------------------------
// Admin writes (service role key — SERVER ONLY, bypass RLS)
// ---------------------------------------------------------------------------

export async function createProduct(
  input: Omit<Product, "id" | "createdAt">,
): Promise<Product> {
  const client = getServerSupabaseClient();
  const id = `p${Date.now()}`;

  const { data, error } = await client
    .from(TABLE)
    .insert({
      id,
      slug: input.slug,
      name: input.name,
      description: input.description,
      price: input.price,
      category: input.category,
      images: input.images,
      badge: input.badge ?? null,
      is_available: input.isAvailable,
      created_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) throw error;
  return rowToProduct(data);
}

export async function updateProduct(
  id: string,
  input: Partial<Product>,
): Promise<Product | null> {
  const client = getServerSupabaseClient();
  const update: Record<string, unknown> = {};

  if (input.slug !== undefined) update.slug = input.slug;
  if (input.name !== undefined) update.name = input.name;
  if (input.description !== undefined) update.description = input.description;
  if (input.price !== undefined) update.price = input.price;
  if (input.category !== undefined) update.category = input.category;
  if (input.images !== undefined) update.images = input.images;
  if (input.badge !== undefined) update.badge = input.badge ?? null;
  if (input.isAvailable !== undefined) update.is_available = input.isAvailable;

  const { data, error } = await client
    .from(TABLE)
    .update(update)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw error;
  return data ? rowToProduct(data) : null;
}

export async function deleteProduct(id: string): Promise<void> {
  const client = getServerSupabaseClient();
  const { error } = await client.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}

/** Hapus semua produk & re-seed dari data statis (untuk tombol "Reset data"). */
export async function resetProducts(seed: Product[]): Promise<void> {
  const client = getServerSupabaseClient();
  const { error: delErr } = await client.from(TABLE).delete().neq("id", "");
  if (delErr) throw delErr;

  const rows = seed.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    price: p.price,
    category: p.category,
    images: p.images,
    badge: p.badge ?? null,
    is_available: p.isAvailable,
    created_at: p.createdAt,
  }));

  const { error: insErr } = await client.from(TABLE).insert(rows);
  if (insErr) throw insErr;
}

/** Generate slug unik berdasarkan nama. */
export { slugify };
