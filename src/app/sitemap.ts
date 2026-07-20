import type { MetadataRoute } from "next";
import { fetchProducts } from "@/lib/product-api";
import { products as seedProducts } from "@/data/products";
import { categories } from "@/data/categories";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://mushida-craft.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: now, priority: 1 },
    { url: `${siteUrl}/katalog`, lastModified: now, priority: 0.9 },
    { url: `${siteUrl}/custom-order`, lastModified: now, priority: 0.8 },
  ];

  // Coba ambil dari Supabase; fallback ke seed statis jika belum dikonfigurasi.
  let products = seedProducts;
  try {
    const supabaseProducts = await fetchProducts();
    if (supabaseProducts.length > 0) {
      products = supabaseProducts;
    }
  } catch {
    // Supabase belum dikonfigurasi — pakai seed statis.
  }

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${siteUrl}/produk/${p.slug}`,
    lastModified: new Date(p.createdAt),
    priority: 0.7,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${siteUrl}/katalog?category=${c.id}`,
    lastModified: now,
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}
