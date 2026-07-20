import type { Product } from "@/types";

/**
 * Seed produk — hanya kategori yang diproduksi:
 * graduation & money-bouquet.
 */
export const products: Product[] = [
  {
    id: "p03",
    slug: "graduation-sunshine",
    name: "Graduation Sunshine",
    description:
      "Bouquet wisuda ceria dengan kombinasi sunflower, baby yellow rose, dan daun salal. Hadiah penuh semangat untuk merayakan kelulusan tersayang.",
    price: 235000,
    category: "graduation",
    images: [
      "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=900&q=80",
      "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=900&q=80",
    ],
    badge: "best-seller",
    isAvailable: true,
    createdAt: "2025-03-01",
  },
  {
    id: "p05",
    slug: "money-bouquet-fortune",
    name: "Money Bouquet Fortune",
    description:
      "Bouquet uang kreatif berisi pecahan rupiah hingga Rp500.000 dipadu mawar artificial premium. Bisa custom nominal sesuai kebutuhan.",
    price: 650000,
    category: "money-bouquet",
    images: [
      "https://images.unsplash.com/photo-1606293459339-aa5d34a7b0e1?w=900&q=80",
      "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=900&q=80",
    ],
    badge: "new",
    isAvailable: true,
    createdAt: "2025-04-10",
  },
  {
    id: "p09",
    slug: "graduation-pastel-bliss",
    name: "Graduation Pastel Bliss",
    description:
      "Bouquet wisuda nuansa pastel pink dan cream dengan boneka mini graduation. Tersedia dalam ukuran medium dan jumbo.",
    price: 285000,
    category: "graduation",
    images: [
      "https://images.unsplash.com/photo-1530092285049-1c42085fd395?w=900&q=80",
      "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=900&q=80",
    ],
    badge: "best-seller",
    isAvailable: true,
    createdAt: "2025-03-22",
  },
  {
    id: "p11",
    slug: "money-bouquet-mini",
    name: "Money Bouquet Mini",
    description:
      "Bouquet uang ukuran mini dengan nominal mulai Rp200.000. Cocok sebagai hadiah ulang tahun dan kado kejutan teman.",
    price: 350000,
    category: "money-bouquet",
    images: [
      "https://images.unsplash.com/photo-1612966769205-a3d76dffa7e8?w=900&q=80",
      "https://images.unsplash.com/photo-1606293459339-aa5d34a7b0e1?w=900&q=80",
    ],
    isAvailable: true,
    createdAt: "2025-04-18",
  },
  {
    id: "p13",
    slug: "graduation-elegant-white",
    name: "Graduation Elegant White",
    description:
      "Bouquet wisuda elegan putih-cream dengan mawar putih, lisianthus, dan eucalyptus. Cocok untuk foto wisuda formal.",
    price: 275000,
    category: "graduation",
    images: [
      "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=900&q=80",
      "https://images.unsplash.com/photo-1530092285049-1c42085fd395?w=900&q=80",
    ],
    badge: "new",
    isAvailable: true,
    createdAt: "2025-05-02",
  },
  {
    id: "p14",
    slug: "money-bouquet-premium",
    name: "Money Bouquet Premium",
    description:
      "Bouquet uang premium ukuran jumbo, bisa custom nominal hingga jutaan. Packaging mewah dengan ribbon satin dan kartu ucapan.",
    price: 950000,
    category: "money-bouquet",
    images: [
      "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=900&q=80",
      "https://images.unsplash.com/photo-1612966769205-a3d76dffa7e8?w=900&q=80",
    ],
    badge: "best-seller",
    isAvailable: true,
    createdAt: "2025-05-10",
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, limit);
}

export function getFeaturedProducts(limit = 4): Product[] {
  return products.filter((p) => p.badge === "best-seller").slice(0, limit);
}
