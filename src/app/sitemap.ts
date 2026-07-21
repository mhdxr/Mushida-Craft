import type { MetadataRoute } from "next";
import { fetchProducts } from "@/lib/product-api";
import { products as seedProducts } from "@/data/products";
import { categories } from "@/data/categories";
import { getSiteUrl } from "@/lib/site";

function productLastModified(createdAt: string): Date {
  // createdAt sering "YYYY-MM-DD" dari mapper — parse aman.
  const d = new Date(createdAt);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/katalog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/custom-order`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  let products = seedProducts;
  try {
    const supabaseProducts = await fetchProducts();
    if (supabaseProducts.length > 0) {
      products = supabaseProducts;
    }
  } catch {
    // fallback seed
  }

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${siteUrl}/produk/${p.slug}`,
    lastModified: productLastModified(p.createdAt),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${siteUrl}/katalog?category=${c.id}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}
