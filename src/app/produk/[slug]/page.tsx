import type { Metadata } from "next";
import { ProductDetailContent } from "@/components/product/product-detail-content";
import { fetchProductBySlug } from "@/lib/product-api";
import { getProductBySlug, products as seedProducts } from "@/data/products";
import { categoryMap } from "@/data/categories";
import { absoluteUrl, canonicalAlternates, getSiteUrl } from "@/lib/site";
import type { Product } from "@/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function productMetadata(product: Product): Metadata {
  const path = `/produk/${product.slug}`;
  return {
    title: product.name,
    description: product.description,
    alternates: canonicalAlternates(path),
    openGraph: {
      title: product.name,
      description: product.description,
      url: absoluteUrl(path),
      images: product.images.slice(0, 1),
    },
  };
}

/**
 * generateStaticParams tetap memakai seed statis agar 12 produk default
 * di-prerender (SSG) untuk SEO. Produk yang dibuat via admin di-render
 * on-demand oleh ProductDetailContent (client component).
 *
 * Catatan: kita tidak query Supabase di sini karena generateStaticParams
 * berjalan saat build — tabel mungkin belum ada. Seed statis cukup.
 */
export async function generateStaticParams() {
  return seedProducts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  // Coba seed statis dulu (sync, cepat).
  const seedProduct = getProductBySlug(slug);

  // Jika tidak ada di seed, coba Supabase (produk admin).
  if (!seedProduct) {
    try {
      const supaProduct = await fetchProductBySlug(slug);
      if (supaProduct) return productMetadata(supaProduct);
    } catch {
      // Supabase belum dikonfigurasi atau tabel belum ada — abaikan.
    }
    return { title: "Produk tidak ditemukan" };
  }

  return productMetadata(seedProduct);
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // Coba seed statis dulu (untuk SSG & metadata build-time).
  const seedProduct = getProductBySlug(slug);

  // Resolve produk (seed SSG atau admin Supabase) untuk JSON-LD + detail.
  let product = seedProduct ?? null;
  if (!product) {
    try {
      product = await fetchProductBySlug(slug);
    } catch {
      // Supabase belum dikonfigurasi — serahkan ke client component.
    }
  }

  if (!product) {
    return <ProductDetailContent slug={slug} initialProduct={null} />;
  }

  const cat = categoryMap[product.category];
  const isAvailable = product.isAvailable && product.badge !== "sold-out";
  const productUrl = absoluteUrl(`/produk/${product.slug}`);
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.id,
    category: cat?.name,
    brand: { "@type": "Brand", name: "Mushida Craft" },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "IDR",
      price: product.price,
      availability: isAvailable
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
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
