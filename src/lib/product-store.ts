"use client";

import { products as seedProducts } from "@/data/products";
import type { Product } from "@/types";

/**
 * Product storage abstraction.
 *
 * Saat ini menggunakan localStorage sebagai data source.
 * Struktur ProductRepository di bawah dirancang agar mudah dipindahkan ke
 * Firebase/Supabase di masa depan tanpa mengubah komponen UI.
 */
const STORAGE_KEY = "Mushida:products:v1";

function isBrowser() {
  return typeof window !== "undefined";
}

function readAll(): Product[] {
  if (!isBrowser()) return seedProducts;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedProducts));
      return seedProducts;
    }
    return JSON.parse(raw) as Product[];
  } catch {
    return seedProducts;
  }
}

function writeAll(items: Product[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export interface ProductRepository {
  list(): Promise<Product[]>;
  getById(id: string): Promise<Product | undefined>;
  create(input: Omit<Product, "id" | "createdAt">): Promise<Product>;
  update(id: string, input: Partial<Product>): Promise<Product | undefined>;
  remove(id: string): Promise<void>;
  reset(): Promise<void>;
}

export const localProductRepository: ProductRepository = {
  async list() {
    return readAll();
  },
  async getById(id) {
    return readAll().find((p) => p.id === id);
  },
  async create(input) {
    const items = readAll();
    const newProduct: Product = {
      ...input,
      id: `p${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    const next = [newProduct, ...items];
    writeAll(next);
    return newProduct;
  },
  async update(id, input) {
    const items = readAll();
    const idx = items.findIndex((p) => p.id === id);
    if (idx === -1) return undefined;
    const updated = { ...items[idx], ...input };
    items[idx] = updated;
    writeAll(items);
    return updated;
  },
  async remove(id) {
    const items = readAll().filter((p) => p.id !== id);
    writeAll(items);
  },
  async reset() {
    writeAll(seedProducts);
  },
};
