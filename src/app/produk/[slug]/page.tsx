import type { Metadata } from "next";
import { ProductDetailContent } from "@/components/product/product-detail-content";
import { fetchAllSlugs, fetchProductBySlug } from "@/lib/product-api";
import { getProductBySlug, products as seedProducts } from "@/data/products";
import { categoryMap } from "@/data/categories";
import { toAbsoluteImageUrls } from "@/lib/image-url";
import { absoluteUrl, canonicalAlternates, getSiteUrl } from "@/lib/site";
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

  const seedProduct = getProductBySlug(slug);
  if (seedProduct) return productMetadata(seedProduct);

  try {
    const supaProduct = await fetchProductBySlug(slug);
    if (supaProduct) return productMetadata(supaProduct);
  } catch {
    // ignore
  }

  return { title: "Produk tidak ditemukan" };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;

  let product: Product | null = getProductBySlug(slug) ?? null;
  if (!product) {
    try {
      product = await fetchProductBySlug(slug);
    } catch {
      // serahkan ke client
    }
  }

  if (!product) {
    return <ProductDetailContent slug={slug} initialProduct={null} />;
  }

  const cat = categoryMap[product.category];
  const isAvailable = product.isAvailable && product.badge !== "sold-out";
  const productUrl = absoluteUrl(`/produk/${product.slug}`);
  const images = toAbsoluteImageUrls(product.images, 8);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: images.length > 0 ? images : undefined,
    sku: product.id,
    category: cat?.name,
    brand: { "@type": "Brand", name: "Mushida Craft" },
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductDetailContent slug={slug} initialProduct={product} />
    </>
  );
}
