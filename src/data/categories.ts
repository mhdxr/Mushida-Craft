import type { CategoryInfo, ProductCategory } from "@/types";

export const categories: CategoryInfo[] = [
  {
    id: "hand-bouquet",
    name: "Hand Bouquet",
    description: "Bouquet genggam elegan untuk berbagai momen spesial.",
    icon: "🌷",
  },
  {
    id: "wedding",
    name: "Wedding",
    description: "Bouquet pengantin yang romantis dan timeless.",
    icon: "💍",
  },
  {
    id: "graduation",
    name: "Graduation",
    description: "Rangkaian bunga untuk merayakan kelulusan.",
    icon: "🎓",
  },
  {
    id: "anniversary",
    name: "Anniversary",
    description: "Hadiah anniversary penuh kesan untuk pasangan.",
    icon: "💕",
  },
  {
    id: "money-bouquet",
    name: "Money Bouquet",
    description: "Bouquet uang unik sebagai hadiah berkesan.",
    icon: "💸",
  },
  {
    id: "dried-flower",
    name: "Dried Flower",
    description: "Bunga kering dengan estetika vintage tahan lama.",
    icon: "🌾",
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
