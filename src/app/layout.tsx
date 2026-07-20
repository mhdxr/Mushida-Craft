import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { WhatsAppFab } from "@/components/common/whatsapp-fab";
import { Toaster } from "@/components/common/toaster";
import { PostHogProvider } from "@/components/analytics/posthog-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://Mushida.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Mushida — Hand-tied Bouquet Artisan",
    template: "%s | Mushida",
  },
  description:
    "Katalog bouquet bunga premium untuk wedding, graduation, anniversary, dan momen spesial lainnya. Order mudah via WhatsApp.",
  keywords: [
    "bouquet bunga",
    "toko bunga online",
    "hand bouquet",
    "wedding bouquet",
    "graduation bouquet",
    "money bouquet",
    "dried flower",
    "Mushida",
  ],
  authors: [{ name: "Mushida" }],
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: siteUrl,
    siteName: "Mushida Craft",
    title: "Mushida Craft — Hand-tied Bouquet Artisan",
    description:
      "Katalog bouquet bunga premium untuk setiap momen spesialmu.",
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
    title: "Mushida Craft — Hand-tied Bouquet Artisan",
    description:
      "Katalog bouquet bunga premium untuk setiap momen spesialmu.",
    images: ["/og-image.jpg"],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
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

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: "Mushida Craft",
  description:
    "Toko bouquet bunga premium dengan layanan order via WhatsApp dan custom request.",
  url: siteUrl,
  image: `${siteUrl}/og-image.jpg`,
  logo: `${siteUrl}/images/logo-wordmark.png`,
  priceRange: "Rp200.000 - Rp2.000.000",
  currenciesAccepted: "IDR",
  paymentAccepted: "Cash, Bank Transfer, E-Wallet",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Navbar />
        <PostHogProvider>
          <main className="min-h-screen">{children}</main>
        </PostHogProvider>
        <Footer />
        <WhatsAppFab />
        <Toaster />
      </body>
    </html>
  );
}
