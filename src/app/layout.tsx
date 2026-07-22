import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { StoreChrome } from "@/components/layout/store-chrome";
import { Toaster } from "@/components/common/toaster";
import { PostHogProvider } from "@/components/analytics/posthog-provider";
import { buildLocalBusinessJsonLd, getSiteUrl } from "@/lib/site";
import { fetchApprovedRatingStats } from "@/lib/testimonial-api";
import "./globals.css";

/**
 * Body / UI — Inter (pasangan natural shadcn/ui).
 * Navbar, form, filter, tabel admin, deskripsi: rapi & mudah dibaca.
 */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/**
 * Heading — Cormorant Garamond (premium boutique florist).
 * Hero, H1–H3, nama produk: elegan, organik, kontras tinggi.
 */
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Mushida Craft — Bouquet Handmade Premium",
    template: "%s | Mushida Craft",
  },
  description:
    "Katalog Snack, Money, Artifisial, Graduation, dan Satin. Custom order mudah via WhatsApp — Mushida Craft, Jakarta Barat.",
  keywords: [
    "snack bouquet",
    "money bouquet",
    "bouquet uang",
    "bunga artifisial",
    "graduation bouquet",
    "bouquet wisuda",
    "bunga satin",
    "bouquet jakarta barat",
    "Mushida Craft",
  ],
  authors: [{ name: "Mushida Craft" }],
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: siteUrl,
    siteName: "Mushida Craft",
    title: "Mushida Craft — Bouquet Handmade Premium",
    description:
      "Katalog bouquet premium untuk setiap momen spesialmu. Same-day Jakarta Barat & sekitarnya.",
    // Share card: JPG 1200×630 (bukan wordmark PNG persegi).
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Mushida Craft",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mushida Craft — Bouquet Handmade Premium",
    description:
      "Katalog bouquet premium untuk setiap momen spesialmu.",
    images: ["/og-image.jpg"],
  },
  robots: { index: true, follow: true },
  // Canonical per-halaman di-set di page metadata — jangan hardcode "/" di root.
  icons: {
    // Favicon modern: PNG (bukan .ico palsu / wordmark lebar).
    icon: [{ url: "/favicon-32.png", sizes: "32x32", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#fff8f5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const jsonLd = buildLocalBusinessJsonLd();

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // AggregateRating dari testimoni approved (jika DB siap).
  let ratingStats: { average: number; count: number } | null = null;
  try {
    ratingStats = await fetchApprovedRatingStats();
  } catch {
    // Supabase belum siap — LocalBusiness tanpa rating.
  }
  const businessJsonLd = ratingStats
    ? buildLocalBusinessJsonLd({ aggregateRating: ratingStats })
    : jsonLd;

  return (
    <html lang="id" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd) }}
        />
        <PostHogProvider>
          {/* StoreChrome: nav/footer/FAB toko; disembunyikan di /admin/* */}
          <StoreChrome>{children}</StoreChrome>
        </PostHogProvider>
        <Toaster />
      </body>
    </html>
  );
}
