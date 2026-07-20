import type { CategoryInfo, ProductCategory } from "@/types";

/**
 * Kategori produksi Mushida Craft:
 * Buket Snack, Buket Money, Artifisial Buket, Graduation Buket, Bunga Satin.
 */
export const categories: CategoryInfo[] = [
  {
    id: "snack-bouquet",
    name: "Buket Snack",
    description: "Buket camilan kreatif untuk hadiah seru dan berkesan.",
    icon: "🍫",
  },
  {
    id: "money-bouquet",
    name: "Buket Money",
    description: "Bouquet uang unik, bisa custom nominal sesuai budget.",
    icon: "💸",
  },
  {
    id: "artificial-bouquet",
    name: "Artifisial Buket",
    description: "Bunga artifisial premium yang awet dan tetap cantik.",
    icon: "🌺",
  },
  {
    id: "graduation",
    name: "Graduation Buket",
    description: "Rangkaian spesial untuk merayakan momen wisuda.",
    icon: "🎓",
  },
  {
    id: "satin-flower",
    name: "Bunga Satin",
    description: "Bunga satin handmade elegan, tahan lama & mewah.",
    icon: "🎀",
  },
];

/**
 * Lookup kategori by id (semua ProductCategory terjamin ada).
 * Dipakai catalog filter summary, product card, admin table.
 */
export const categoryMap: Record<ProductCategory, CategoryInfo> =
  categories.reduce(
    (acc, c) => {
      acc[c.id] = c;
      return acc;
    },
    {} as Record<ProductCategory, CategoryInfo>,
  );

/** Daftar id kategori (untuk filter / allowlist). */
export const categoryIds: ProductCategory[] = categories.map((c) => c.id);
