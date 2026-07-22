"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Camera, Mail, MessageCircle } from "lucide-react";
import { BrandLogo } from "@/components/common/brand-logo";
import { TrackedWhatsAppLink } from "@/components/analytics/tracked-whatsapp-link";
import { categories as seedCategories } from "@/data/categories";
import { AnalyticsEvent } from "@/lib/analytics";
import {
  buildDefaultInquiryMessage,
  buildWhatsAppUrl,
  formatWhatsAppDisplay,
} from "@/lib/whatsapp";
import type { CategoryInfo } from "@/types";

const exploreLinks = [
  { href: "/katalog", label: "Katalog" },
  { href: "/custom-order", label: "Custom Order" },
  { href: "/#cara-order", label: "Cara Order" },
  { href: "/#testimoni", label: "Testimoni" },
  { href: "/#faq", label: "FAQ" },
];

export function Footer() {
  const [categories, setCategories] = useState<CategoryInfo[]>(seedCategories);
  const whatsappUrl = buildWhatsAppUrl(buildDefaultInquiryMessage());
  const whatsappLabel = formatWhatsAppDisplay();

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/categories", { cache: "no-store" });
        const json = await res.json();
        if (!active || !json?.ok || !Array.isArray(json.categories)) return;
        if (json.categories.length > 0) {
          setCategories(json.categories);
        }
      } catch {
        // keep seed
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <footer className="border-t border-border/40 bg-[linear-gradient(180deg,#fffaf6_0%,#fff5f1_100%)]">
      <div className="container py-14 md:py-16">
        <div className="grid gap-12 md:grid-cols-12 md:gap-10">
          <div className="space-y-5 md:col-span-4">
            <BrandLogo size="md" />
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Bouquet premium handmade — snack, money, artifisial, graduation,
              dan satin — dirangkai personal untuk momen yang berarti.
            </p>
            <TrackedWhatsAppLink
              href={whatsappUrl}
              event={AnalyticsEvent.CLICK_WA_FOOTER}
              eventProps={{ source: "footer" }}
              className="inline-flex items-center gap-2 text-sm font-medium tracking-wide text-foreground transition-colors hover:text-primary"
            >
              <MessageCircle className="h-4 w-4 text-primary" />
              WhatsApp {whatsappLabel}
            </TrackedWhatsAppLink>
          </div>

          <div className="md:col-span-2">
            <h4 className="mb-5 font-serif text-sm font-semibold tracking-[0.14em] text-foreground uppercase">
              Jelajah
            </h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="mb-5 font-serif text-sm font-semibold tracking-[0.14em] text-foreground uppercase">
              Kategori
            </h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/katalog?category=${cat.id}`}
                    className="transition-colors hover:text-foreground"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="mb-5 font-serif text-sm font-semibold tracking-[0.14em] text-foreground uppercase">
              Kontak
            </h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li>
                <a
                  href="https://www.instagram.com/mushida_craft"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-foreground shadow-sm ring-1 ring-border/50">
                    <Camera className="h-3.5 w-3.5" />
                  </span>
                  @mushida_craft
                </a>
              </li>
              <li>
                <a
                  href="mailto:mushidacraft@gmail.com"
                  className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-foreground shadow-sm ring-1 ring-border/50">
                    <Mail className="h-3.5 w-3.5" />
                  </span>
                  mushidacraft@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border/40 pt-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Mushida Craft. All rights reserved.</p>
          <p className="italic">Made with 🌸 in Indonesia.</p>
        </div>
      </div>
    </footer>
  );
}
