import type { Product } from "@/types";

/**
 * Seed produk — 5 kategori produksi Mushida Craft.
 * Ganti foto Unsplash dengan foto asli lewat admin upload.
 */
export const products: Product[] = [
  {
    id: "p01",
    slug: "snack-bouquet-choco-delight",
    name: "Snack Bouquet Choco Delight",
    description:
      "Buket snack berisi aneka coklat premium dan camilan favorit, dibungkus rapi dengan ribbon saten. Cocok untuk ulang tahun dan kejutan teman.",
    price: 185000,
    category: "snack-bouquet",
    images: [
      "https://images.unsplash.com/photo-1548907040-4baa42d10919?w=900&q=80",
      "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=900&q=80",
    ],
    badge: "best-seller",
    isAvailable: true,
    createdAt: "2025-03-01",
  },
  {
    id: "p02",
    slug: "money-bouquet-fortune",
    name: "Money Bouquet Fortune",
    description:
      "Bouquet uang kreatif berisi pecahan rupiah dipadu aksen bunga artifisial premium. Bisa custom nominal sesuai kebutuhan.",
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
    id: "p03",
    slug: "artificial-rose-blush",
    name: "Artificial Rose Blush",
    description:
      "Buket mawar artifisial nuansa blush pink dengan greenery, awet bertahun-tahun tanpa layu. Ideal untuk dekor kamar dan hadiah long-lasting.",
    price: 225000,
    category: "artificial-bouquet",
    images: [
      "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=900&q=80",
      "https://images.unsplash.com/photo-1457089328389-e5d62b8c4d10?w=900&q=80",
    ],
    badge: "best-seller",
    isAvailable: true,
    createdAt: "2025-03-15",
  },
  {
    id: "p04",
    slug: "graduation-sunshine",
    name: "Graduation Sunshine",
    description:
      "Bouquet wisuda ceria dengan aksen sunflower dan boneka mini graduation. Hadiah penuh semangat untuk merayakan kelulusan.",
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
    slug: "satin-peony-elegance",
    name: "Satin Peony Elegance",
    description:
      "Bunga peony satin handmade dengan detail rapi dan warna soft pastel. Tahan lama, cocok untuk kado spesial dan dekor meja.",
    price: 195000,
    category: "satin-flower",
    images: [
      "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=900&q=80",
      "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=900&q=80",
    ],
    badge: "new",
    isAvailable: true,
    createdAt: "2025-05-02",
  },
  {
    id: "p06",
    slug: "snack-bouquet-party-mix",
    name: "Snack Bouquet Party Mix",
    description:
      "Mix snack favorit (keripik, permen, coklat) dalam susunan buket meriah. Bisa request brand camilan sesuai selera penerima.",
    price: 165000,
    category: "snack-bouquet",
    images: [
      "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=900&q=80",
      "https://images.unsplash.com/photo-1548907040-4baa42d10919?w=900&q=80",
    ],
    isAvailable: true,
    createdAt: "2025-04-18",
  },
  {
    id: "p07",
    slug: "money-bouquet-mini",
    name: "Money Bouquet Mini",
    description:
      "Bouquet uang ukuran mini dengan nominal mulai Rp200.000. Cocok sebagai hadiah ulang tahun dan kado kejutan.",
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
    id: "p08",
    slug: "artificial-lavender-dream",
    name: "Artificial Lavender Dream",
    description:
      "Buket lavender artifisial nuansa ungu pastel dengan dusty miller. Estetika soft yang cocok untuk hadiah romantis.",
    price: 245000,
    category: "artificial-bouquet",
    images: [
      "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=900&q=80",
      "https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=900&q=80",
    ],
    isAvailable: true,
    createdAt: "2025-02-28",
  },
  {
    id: "p09",
    slug: "graduation-pastel-bliss",
    name: "Graduation Pastel Bliss",
    description:
      "Bouquet wisuda nuansa pastel pink dan cream dengan boneka mini graduation. Tersedia ukuran medium dan jumbo.",
    price: 285000,
    category: "graduation",
    images: [
      "https://images.unsplash.com/photo-1530092285049-1c42085fd395?w=900&q=80",
      "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=900&q=80",
    ],
    badge: "new",
    isAvailable: true,
    createdAt: "2025-03-22",
  },
  {
    id: "p10",
    slug: "satin-rose-classic",
    name: "Satin Rose Classic",
    description:
      "Mawar satin klasik warna merah & cream, dirangkai rapi dengan wrapping premium. Hadiah timeless yang tidak layu.",
    price: 210000,
    category: "satin-flower",
    images: [
      "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=900&q=80",
      "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=900&q=80",
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
