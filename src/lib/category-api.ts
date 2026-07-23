import {
  getBrowserSupabaseClient,
  getServerSupabaseClient,
} from "@/lib/supabase";
import { categories as seedCategories } from "@/data/categories";
import type { CategoryInfo, ProductCategory } from "@/types";

const TABLE = "categories";

export interface CategoryRecord extends CategoryInfo {
  sortOrder: number;
  isActive: boolean;
  updatedAt?: string;
}

interface CategoryRow {
  id: string;
  name: string;
  description: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
  updated_at?: string;
}

const ALLOWED_IDS = new Set(seedCategories.map((c) => c.id));

function rowToCategory(row: CategoryRow): CategoryRecord {
  return {
    id: row.id as ProductCategory,
    name: row.name,
    description: row.description ?? "",
    icon: row.icon ?? "",
    sortOrder: row.sort_order ?? 0,
    isActive: row.is_active !== false,
    updatedAt: row.updated_at,
  };
}

function seedAsRecords(): CategoryRecord[] {
  return seedCategories.map((c, i) => ({
    ...c,
    sortOrder: (i + 1) * 10,
    isActive: true,
  }));
}

/**
 * Public: kategori aktif, urut sort_order.
 * - Query sukses + kosong → [] (jangan resurrect seed; admin bisa nonaktifkan semua).
 * - Error / DB unconfigured → seed (agar build & dev tanpa Supabase tetap jalan).
 */
export async function fetchCategories(options?: {
  includeInactive?: boolean;
}): Promise<CategoryRecord[]> {
  try {
    const client = getBrowserSupabaseClient();
    let query = client
      .from(TABLE)
      .select("*")
      .order("sort_order", { ascending: true });

    if (!options?.includeInactive) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data ?? []).map((r) => rowToCategory(r as CategoryRow));
  } catch {
    // Hanya fallback seed saat DB gagal — empty sukses dihormati.
    return seedAsRecords();
  }
}

/** Admin: semua kategori (termasuk nonaktif). */
export async function listAllCategories(): Promise<CategoryRecord[]> {
  const client = getServerSupabaseClient();
  const { data, error } = await client
    .from(TABLE)
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  const rows = (data ?? []).map((r) => rowToCategory(r as CategoryRow));
  return rows.length > 0 ? rows : seedAsRecords();
}

/** Admin: update metadata kategori (name/description/icon/sort/active). ID fixed. */
export async function updateCategory(
  id: ProductCategory,
  input: {
    name?: string;
    description?: string;
    icon?: string;
    sortOrder?: number;
    isActive?: boolean;
  },
): Promise<CategoryRecord | null> {
  if (!ALLOWED_IDS.has(id)) {
    throw new Error("ID kategori tidak dikenali.");
  }

  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.name !== undefined) update.name = input.name.trim();
  if (input.description !== undefined)
    update.description = input.description.trim();
  if (input.icon !== undefined) update.icon = input.icon.trim();
  if (input.sortOrder !== undefined) update.sort_order = input.sortOrder;
  if (input.isActive !== undefined) update.is_active = input.isActive;

  const client = getServerSupabaseClient();
  const { data, error } = await client
    .from(TABLE)
    .update(update)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw error;
  return data ? rowToCategory(data as CategoryRow) : null;
}

/** Map id → CategoryInfo (untuk label kartu produk, dsb.). */
export function toCategoryMap(
  list: CategoryInfo[],
): Record<string, CategoryInfo> {
  return list.reduce(
    (acc, c) => {
      acc[c.id] = c;
      return acc;
    },
    {} as Record<string, CategoryInfo>,
  );
}
