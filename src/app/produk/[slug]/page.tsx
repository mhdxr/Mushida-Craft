import type { Metadata } from "next";
import { ProductDetailContent } from "@/components/product/product-detail-content";
import { fetchAllSlugs, fetchProductBySlug } from "@/lib/product-api";
import { fetchApprovedRatingStats } from "@/lib/testimonial-api";
import { getProductBySlug, products as seedProducts } from "@/data/products";
import { categoryMap } from "@/data/categories";
import { toAbsoluteImageUrls } from "@/lib/image-url";
import {
  absoluteUrl,
  canonicalAlternates,
  getSiteUrl,
  safeJsonLd,
} from "@/lib/site";
import type { Product } from "@/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** Izinkan slug admin baru di luar generateStaticParams. */
export const dynamicParams = true;

function productMetadata(product: Product): Metadata {
  const path = `/produk/${product.slug}`;
  const images = toAbsoluteImageUrls(product.images, 3);

  return {
    title: product.name,
    description: product.description,
    alternates: canonicalAlternates(path),
    openGraph: {
      title: product.name,
      description: product.description,
      url: absoluteUrl(path),
      type: "website",
      images: images.map((url) => ({
        url,
        alt: product.name,
      })),
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description,
      images: images.slice(0, 1),
    },
  };
}

/**
 * Resolve produk: DB dulu (data live), seed hanya jika query gagal
 * (Supabase unconfigured/error). Null DB yang sukses = produk memang tidak ada.
 */
async function resolveProduct(slug: string): Promise<Product | null> {
  try {
    const fromDb = await fetchProductBySlug(slug);
    // Query sukses: hormati hasil (termasuk null bila dihapus).
    return fromDb;
  } catch {
    // DB belum siap / error jaringan → fallback seed agar build & dev tanpa DB tetap jalan.
    return getProductBySlug(slug) ?? null;
  }
}

/**
 * SSG params: seed (selalu) ∪ slug Supabase (jika DB tersedia saat build).
 * Gagal query → tetap build dari seed saja.
 */
export async function generateStaticParams() {
  const fromSeed = seedProducts.map((p) => p.slug);
  let fromDb: string[] = [];

  try {
    fromDb = await fetchAllSlugs();
  } catch {
    // Build tanpa Supabase / tabel belum ada.
  }

  const slugs = Array.from(new Set([...fromSeed, ...fromDb]));
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await resolveProduct(slug);
  if (product) return productMetadata(product);
  return { title: "Produk tidak ditemukan" };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await resolveProduct(slug);

  if (!product) {
    return <ProductDetailContent slug={slug} initialProduct={null} />;
  }

  const cat = categoryMap[product.category];
  const isAvailable = product.isAvailable && product.badge !== "sold-out";
  const productUrl = absoluteUrl(`/produk/${product.slug}`);
  const images = toAbsoluteImageUrls(product.images, 8);

  // Aggregate rating site dari testimoni approved (bukan per-produk rating).
  let aggregateRating:
    | { "@type": "AggregateRating"; ratingValue: number; reviewCount: number }
    | undefined;
  try {
    const stats = await fetchApprovedRatingStats();
    if (stats && stats.count >= 2) {
      aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: stats.average,
        reviewCount: stats.count,
      };
    }
  } catch {
    // skip bila Supabase down
  }

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: images.length > 0 ? images : undefined,
    sku: product.id,
    category: cat?.name,
    brand: { "@type": "Brand", name: "Mushida Craft" },
    ...(aggregateRating ? { aggregateRating } : {}),
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "IDR",
      price: product.price,
      // Fixed horizon (bukan Date.now di render — lolos purity lint).
      priceValidUntil: "2027-12-31",
      availability: isAvailable
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: "Mushida Craft",
        url: getSiteUrl(),
      },
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Beranda",
        item: getSiteUrl(),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Katalog",
        item: absoluteUrl("/katalog"),
      },
      ...(cat
        ? [
            {
              "@type": "ListItem" as const,
              position: 3,
              name: cat.name,
              item: absoluteUrl(`/katalog?category=${product.category}`),
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: cat ? 4 : 3,
        name: product.name,
        item: productUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }}
      />
      <ProductDetailContent slug={slug} initialProduct={product} />
    </>
  );
}
