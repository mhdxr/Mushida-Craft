import type { CategoryInfo, ProductCategory } from "@/types";

/**
 * Kategori produksi Mushida Craft (ID slug + nama tampilan tanpa "Buket"):
 * snack-bouquet, money-bouquet, artificial-bouquet, graduation-bouquet, satin-flower
 * Label UI (Pilihan A): Snack, Money, Artifisial, Graduation, Satin
 */
export const categories: CategoryInfo[] = [
  {
    id: "snack-bouquet",
    name: "Snack",
    description: "Rangkaian camilan kreatif untuk hadiah seru dan berkesan.",
    icon: "🍫",
  },
  {
    id: "money-bouquet",
    name: "Money",
    description: "Rangkaian uang unik, bisa custom nominal sesuai budget.",
    icon: "💸",
  },
  {
    id: "artificial-bouquet",
    name: "Artifisial",
    description: "Bunga artifisial premium yang awet dan tetap cantik.",
    icon: "🌺",
  },
  {
    id: "graduation-bouquet",
    name: "Graduation",
    description: "Rangkaian spesial untuk merayakan momen wisuda.",
    icon: "🎓",
  },
  {
    id: "satin-flower",
    name: "Satin",
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
