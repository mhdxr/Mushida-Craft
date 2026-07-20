import Link from "next/link";
import { Camera, MessageCircle } from "lucide-react";
import { BrandLogo } from "@/components/common/brand-logo";
import { categories } from "@/data/categories";
import {
  buildDefaultInquiryMessage,
  buildWhatsAppUrl,
  formatWhatsAppDisplay,
} from "@/lib/whatsapp";

export function Footer() {
  const whatsappUrl = buildWhatsAppUrl(buildDefaultInquiryMessage());
  const whatsappLabel = formatWhatsAppDisplay();

  return (
    <footer className="border-t border-border/60 bg-cream-50">
      <div className="container py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="space-y-4">
            <BrandLogo size="md" />
            <p className="text-sm text-muted-foreground">
              Snack, Money, Artifisial, Graduation, dan Satin —
              premium, elegan, dengan sentuhan personal.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-serif text-base font-semibold">Jelajah</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/katalog" className="hover:text-foreground">
                  Katalog
                </Link>
              </li>
              <li>
                <Link href="/custom-order" className="hover:text-foreground">
                  Custom Order
                </Link>
              </li>
              <li>
                <Link href="/#cara-order" className="hover:text-foreground">
                  Cara Order
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-foreground">
                  Admin
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-serif text-base font-semibold">Kategori</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/katalog?category=${cat.id}`}
                    className="hover:text-foreground"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-serif text-base font-semibold">Kontak</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-primary" />
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-foreground"
                >
                  WhatsApp {whatsappLabel}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-primary" />
                <a
                  href="https://www.instagram.com/mushida_craft"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-foreground"
                >
                  @mushida_craft
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} Mushida Craft. All rights reserved.</p>
          <p>Made with 🌸 in Indonesia.</p>
        </div>
      </div>
    </footer>
  );
}
