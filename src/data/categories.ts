import type { CategoryInfo, ProductCategory } from "@/types";

/**
 * Kategori yang diproduksi Mushida Craft.
 * Hanya Graduation & Money Bouquet (hand-bouquet / wedding /
 * anniversary / dried-flower sudah dihapus).
 */
export const categories: CategoryInfo[] = [
  {
    id: "graduation",
    name: "Graduation",
    description: "Rangkaian bunga untuk merayakan kelulusan.",
    icon: "🎓",
  },
  {
    id: "money-bouquet",
    name: "Money Bouquet",
    description: "Bouquet uang unik sebagai hadiah berkesan.",
    icon: "💸",
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
