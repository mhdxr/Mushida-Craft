import type { Metadata } from "next";
import { ProductDetailContent } from "@/components/product/product-detail-content";
import { getProductBySlug, products } from "@/data/products";
import { categoryMap } from "@/data/categories";

interface PageProps {
  params: { slug: string };
}

/**
 * generateStaticParams tetap memakai seed statis agar 12 produk default
 * di-prerender (SSG) untuk SEO. Produk yang dibuat via admin (localStorage)
 * dirender on-demand oleh ProductDetailContent (client component) karena
 * dynamicParams bernilai true secara default di App Router.
 */
export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const product = getProductBySlug(params.slug);
  if (!product) return { title: "Produk tidak ditemukan" };
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images.slice(0, 1),
    },
  };
}

export default function ProductDetailPage({ params }: PageProps) {
  const seedProduct = getProductBySlug(params.slug);

  // Untuk produk seed: kita punya data lengkap di build time -> JSON-LD statis.
  // Untuk produk admin (localStorage): JSON-LD dilewati (konten dirender client-side).
  if (seedProduct) {
    const cat = categoryMap[seedProduct.category];
    const isAvailable =
      seedProduct.isAvailable && seedProduct.badge !== "sold-out";
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://Mushida.vercel.app";
    const productJsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: seedProduct.name,
      description: seedProduct.description,
      image: seedProduct.images,
      sku: seedProduct.id,
      category: cat?.name,
      brand: { "@type": "Brand", name: "Mushida" },
      offers: {
        "@type": "Offer",
        url: `${siteUrl}/produk/${seedProduct.slug}`,
        priceCurrency: "IDR",
        price: seedProduct.price,
        availability: isAvailable
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      },
    };

    return (
      <>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
        <ProductDetailContent slug={params.slug} />
      </>
    );
  }

  // Slug tidak ada di seed -> bisa jadi produk admin (localStorage) atau 404.
  // Serahkan penanganan ke client component.
  return <ProductDetailContent slug={params.slug} />;
}
