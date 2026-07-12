import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { WhatsAppFab } from "@/components/common/whatsapp-fab";
import { Toaster } from "@/components/common/toaster";
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
    siteName: "Mushida",
    title: "Mushida — Hand-tied Bouquet Artisan",
    description:
      "Katalog bouquet bunga premium untuk setiap momen spesialmu.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mushida — Hand-tied Bouquet Artisan",
    description:
      "Katalog bouquet bunga premium untuk setiap momen spesialmu.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  icons: { icon: "/favicon.ico" },
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
  name: "Mushida",
  description:
    "Toko bouquet bunga premium dengan layanan order via WhatsApp dan custom request.",
  url: siteUrl,
  image: `${siteUrl}/og-image.jpg`,
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
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <WhatsAppFab />
        <Toaster />
      </body>
    </html>
  );
}
