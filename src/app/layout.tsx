import type { Metadata, Viewport } from "next";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { WhatsAppFab } from "@/components/common/whatsapp-fab";
import { Toaster } from "@/components/common/toaster";
import { PostHogProvider } from "@/components/analytics/posthog-provider";
import { buildLocalBusinessJsonLd, getSiteUrl } from "@/lib/site";
import "./globals.css";

/**
 * Body UI — netral, rapi, premium tanpa kesan “trendy”.
 * Source Sans 3: humanist sans klasik (Adobe), mudah dibaca.
 */
const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

/**
 * Heading — serif tenang, elegan, tidak display/nyentrik.
 * Source Serif 4: pasangan resmi Source Sans.
 */
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${sourceSans.variable} ${sourceSerif.variable}`}
    >
      <body className="font-sans antialiased">
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
