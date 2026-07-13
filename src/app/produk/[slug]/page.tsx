import type { Metadata } from "next";
import { ProductDetailContent } from "@/components/product/product-detail-content";
import { fetchProductBySlugServer } from "@/lib/product-api";
import { getProductBySlug, products as seedProducts } from "@/data/products";
import { categoryMap } from "@/data/categories";

interface PageProps {
  params: Promise<{ slug: string }>;
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
      const supaProduct = await fetchProductBySlugServer(slug);
      if (supaProduct) {
        return {
          title: supaProduct.name,
          description: supaProduct.description,
          openGraph: {
            title: supaProduct.name,
            description: supaProduct.description,
            images: supaProduct.images.slice(0, 1),
          },
        };
      }
    } catch {
      // Supabase belum dikonfigurasi atau tabel belum ada — abaikan.
    }
    return { title: "Produk tidak ditemukan" };
  }

  return {
    title: seedProduct.name,
    description: seedProduct.description,
    openGraph: {
      title: seedProduct.name,
      description: seedProduct.description,
      images: seedProduct.images.slice(0, 1),
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // Coba seed statis dulu (untuk SSG & metadata build-time).
  const seedProduct = getProductBySlug(slug);

  // Jika ada di seed, gunakan untuk JSON-LD statis.
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
        <ProductDetailContent slug={slug} initialProduct={seedProduct} />
      </>
    );
  }

  // Slug tidak ada di seed → bisa jadi produk admin (Supabase) atau 404.
  // Coba fetch dari Supabase untuk metadata JSON-LD.
  let adminProduct = null;
  try {
    adminProduct = await fetchProductBySlugServer(slug);
  } catch {
    // Supabase belum dikonfigurasi — serahkan ke client component.
  }

  return <ProductDetailContent slug={slug} initialProduct={adminProduct} />;
}
