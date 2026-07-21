/**
 * URL situs & metadata helpers (SEO).
 * NEXT_PUBLIC_SITE_URL di-inline saat build.
 */

import { getDeliveryInfo } from "@/lib/delivery";
import { getWhatsAppNumber } from "@/lib/whatsapp";

const FALLBACK_SITE_URL = "https://mushida-craft.vercel.app";

/** Base URL publik tanpa trailing slash. */
export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || FALLBACK_SITE_URL;
  return raw.replace(/\/$/, "");
}

/** Absolute path helper, path boleh diawali `/` atau tidak. */
export function absoluteUrl(path = "/"): string {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Metadata.alternates.canonical untuk App Router. */
export function canonicalAlternates(path = "/") {
  return { canonical: path.startsWith("/") ? path : `/${path}` };
}

/**
 * Parse jam operasional env → schema.org OpeningHoursSpecification.
 * Mendukung format seperti:
 *   "Senin–Sabtu · 09.00–18.00 WIB"
 *   "Senin-Sabtu 09:00-18:00"
 * Fallback: Mo–Sa 09:00–18:00.
 */
function parseOpeningHours(hours: string): {
  dayOfWeek: string[];
  opens: string;
  closes: string;
} {
  const dayMap: Record<string, string> = {
    senin: "Monday",
    monday: "Monday",
    selasa: "Tuesday",
    tuesday: "Tuesday",
    rabu: "Wednesday",
    wednesday: "Wednesday",
    kamis: "Thursday",
    thursday: "Thursday",
    jumat: "Friday",
    "jumat'": "Friday",
    jum: "Friday",
    friday: "Friday",
    sabtu: "Saturday",
    saturday: "Saturday",
    minggu: "Sunday",
    ahad: "Sunday",
    sunday: "Sunday",
  };

  const defaultDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  let opens = "09:00";
  let closes = "18:00";
  let days = defaultDays;

  const timeMatch = hours.match(
    /(\d{1,2})[:.](\d{2})\s*[–\-—]\s*(\d{1,2})[:.](\d{2})/,
  );
  if (timeMatch) {
    opens = `${timeMatch[1].padStart(2, "0")}:${timeMatch[2]}`;
    closes = `${timeMatch[3].padStart(2, "0")}:${timeMatch[4]}`;
  }

  const rangeMatch = hours.match(
    /(senin|monday|selasa|tuesday)\s*[–\-—]\s*(sabtu|saturday|minggu|sunday|jumat|friday)/i,
  );
  if (rangeMatch) {
    const start = dayMap[rangeMatch[1].toLowerCase()];
    const end = dayMap[rangeMatch[2].toLowerCase()];
    const order = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    if (start && end) {
      const i = order.indexOf(start);
      const j = order.indexOf(end);
      if (i >= 0 && j >= i) days = order.slice(i, j + 1);
    }
  }

  return { dayOfWeek: days, opens, closes };
}

/**
 * JSON-LD LocalBusiness / Florist untuk homepage & layout.
 * Pakai data area (Jakarta Barat) bila env di-set; tanpa alamat jalan
 * agar tidak mengarang alamat fisik.
 */
export function buildLocalBusinessJsonLd() {
  const siteUrl = getSiteUrl();
  const delivery = getDeliveryInfo();
  const phone = getWhatsAppNumber();
  const hours = parseOpeningHours(delivery.hours);

  const areaServed =
    delivery.areas.length > 0
      ? delivery.areas.map((name) => ({
          "@type": "AdministrativeArea",
          name,
        }))
      : delivery.city
        ? [{ "@type": "AdministrativeArea", name: delivery.city }]
        : [{ "@type": "Country", name: "Indonesia" }];

  const address = delivery.city
    ? {
        "@type": "PostalAddress",
        addressLocality: delivery.city,
        addressRegion: "DKI Jakarta",
        addressCountry: "ID",
      }
    : {
        "@type": "PostalAddress",
        addressCountry: "ID",
      };

  return {
    "@context": "https://schema.org",
    "@type": ["Store", "Florist"],
    name: "Mushida Craft",
    description:
      "Bouquet handmade premium — snack, money, artifisial, graduation, dan satin. Order via WhatsApp, same-day di area layanan.",
    url: siteUrl,
    image: `${siteUrl}/og-image.jpg`,
    logo: `${siteUrl}/images/logo-wordmark.png`,
    telephone: `+${phone}`,
    priceRange: "Rp200.000 - Rp2.000.000",
    currenciesAccepted: "IDR",
    paymentAccepted: "Cash, Bank Transfer, E-Wallet",
    address,
    areaServed,
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: hours.dayOfWeek,
        opens: hours.opens,
        closes: hours.closes,
      },
    ],
    sameAs: ["https://www.instagram.com/mushida_craft"],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        telephone: `+${phone}`,
        availableLanguage: ["Indonesian"],
        email: "mushidacraft@gmail.com",
      },
    ],
  };
}
